import * as core from "@actions/core";
import * as github from "@actions/github";

async function fetchFlavors(apiKey) {
  try {
    const response = await fetch("https://ilesfsxvmvavrlmojmba.supabase.co/functions/v1/project-flavors", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const flavors = await response.json();
    return flavors;
  } catch (error) {
    throw new Error(`Failed to fetch flavors: ${error.message}`);
  }
}

async function triggerBuildWorkflow(octokit, owner, repo, workflowId, flavor) {
  try {
    core.info(`Triggering build workflow for flavor: ${flavor.name || flavor.id || 'unknown'}`);
    
    const response = await octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: workflowId,
      ref: 'main', // or the branch you want to trigger on
      inputs: {
        flavor: JSON.stringify(flavor),
        flavorName: flavor.name || flavor.id || 'unknown',
        flavorId: flavor.id || flavor.name || 'unknown'
      }
    });
    
    core.info(`Successfully triggered build workflow for flavor: ${flavor.name || flavor.id}`);
    return response;
  } catch (error) {
    core.error(`Failed to trigger build workflow for flavor ${flavor.name || flavor.id}: ${error.message}`);
    throw error;
  }
}

try {
  // Get inputs
  const apiKey = core.getInput("project-api-key");
  const buildWorkflow = core.getInput("build-workflow");
  const githubToken = core.getInput("github-token");
  
  if (!apiKey) {
    throw new Error("project-api-key input is required");
  }
  
  if (!buildWorkflow) {
    throw new Error("build-workflow input is required");
  }

  core.info("Fetching flavors...");

  // Fetch flavors using the API key
  const flavors = await fetchFlavors(apiKey);
  
  core.info(`Successfully fetched ${flavors.length || 0} flavors`);
  
  // Set the flavors as output
  core.setOutput("flavors", JSON.stringify(flavors));
  
  // Log the flavors for debugging (consider removing in production)
  core.info(`Flavors: ${JSON.stringify(flavors, null, 2)}`);

  // Trigger build workflow for each flavor if build-workflow is specified
  if (buildWorkflow && githubToken) {
    const octokit = github.getOctokit(githubToken);
    const { owner, repo } = github.context.repo;
    
    core.info(`Triggering build workflow "${buildWorkflow}" for ${flavors.length} flavors...`);
    
    const buildPromises = flavors.map(flavor => 
      triggerBuildWorkflow(octokit, owner, repo, buildWorkflow, flavor)
    );
    
    try {
      await Promise.all(buildPromises);
      core.info("Successfully triggered build workflows for all flavors");
    } catch (error) {
      core.error(`Some build workflows failed to trigger: ${error.message}`);
      // Continue execution even if some workflows fail
    }
  } else if (buildWorkflow && !githubToken) {
    core.warning("build-workflow specified but github-token not provided. Skipping workflow triggers.");
  }

} catch (error) {
  core.setFailed(error.message);
}