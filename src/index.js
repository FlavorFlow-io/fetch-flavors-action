import * as core from "@actions/core";

async function fetchFlavors(apiKey, projectId) {
  try {
    const response = await fetch(
      `https://api.flavorflow.io/v1/projects/${encodeURIComponent(projectId)}/clients`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        }
      }
    );

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error || errorData.message) {
          errorMessage += `\n${errorData.message || errorData.error}`;
          if (errorData.details) {
            errorMessage += `\nDetails: ${JSON.stringify(errorData.details)}`;
          }
        }
      } catch (parseError) {
        // If we can't parse the error response, use the default message
        core.debug(`Could not parse error response: ${parseError.message}`);
      }
      throw new Error(errorMessage);
    }

    const body = await response.json();
    // The /v1 API wraps payloads in a { data, error } envelope; the list of
    // clients is the array under `data`.
    if (!body.data || !Array.isArray(body.data)) {
      throw new Error("Response does not contain a valid 'data' array");
    }

    return body.data;
  } catch (error) {
    throw new Error(`Failed to fetch Clients: ${error.message}`);
  }
}

try {
  // Get inputs
  const apiKey = core.getInput("api-key");
  const projectId = core.getInput("project-id");

  if (!apiKey) {
    throw new Error("api-key input is required");
  }
  if (!projectId) {
    throw new Error("project-id input is required");
  }

  core.info("🔍 Fetching available clients...");

  // Fetch clients for the project using the API key
  const flavors = await fetchFlavors(apiKey, projectId);
  
  core.info(`✅ Successfully fetched ${flavors.length || 0} flavors`);

  // Build the matrix. Each entry nests the full client configuration under
  // `flavor`, so a consuming workflow can read individual fields
  // (`matrix.flavor.name`, `matrix.flavor.app_name`, …) and hand the whole
  // object to apply-flavor-action as `${{ matrix.flavor }}` — GitHub serializes
  // it to JSON for the input, so no `toJson(matrix)` round-trip is needed.
  const matrix = flavors.map((flavor) => ({ flavor }));

  // A bare JSON array the workflow consumes with `include: ${{ fromJson(...) }}`
  // (fromJson is unavoidable: matrix.include must be a real array and job
  // outputs are always strings).
  core.setOutput("flavors", JSON.stringify(matrix));

} catch (error) {
  core.setFailed(error.message);
}