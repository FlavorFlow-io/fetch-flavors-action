import * as core from "@actions/core";

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

    const data = await response.json();
    
    // Extract flavors array from the response
    if (!data.flavors || !Array.isArray(data.flavors)) {
      throw new Error("Response does not contain a valid 'flavors' array");
    }
    
    return data.flavors;
  } catch (error) {
    throw new Error(`Failed to fetch flavors: ${error.message}`);
  }
}

try {
  // Get inputs
  const apiKey = core.getInput("project-api-key");

  if (!apiKey) {
    throw new Error("project-api-key input is required");
  }

  core.info("Fetching flavors...");

  // Fetch flavors using the API key
  const flavors = await fetchFlavors(apiKey);
  
  core.info(`Successfully fetched ${flavors.length || 0} flavors`);
  
  // Set outputs for matrix strategy
  core.setOutput("flavors", JSON.stringify({ include: flavors }));
  
  // Log the flavors for debugging
  core.info(`Flavors: ${JSON.stringify(flavors, null, 2)}`);

} catch (error) {
  core.setFailed(error.message);
}