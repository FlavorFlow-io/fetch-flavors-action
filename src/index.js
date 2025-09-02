import * as core from "@actions/core";

async function fetchFlavors(apiKey) {
  try {
    const response = await fetch("https://ilesfsxvmvavrlmojmba.supabase.co/functions/v1/fetch-clients", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });

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

    const data = await response.json();
    
    // Extract Clients array from the response
    if (!data.flavors || !Array.isArray(data.flavors)) {
      throw new Error("Response does not contain a valid 'flavors' array");
    }
    
    return data.Clients;
  } catch (error) {
    throw new Error(`Failed to fetch Clients: ${error.message}`);
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
  core.info(`flavors: ${JSON.stringify(flavors, null, 2)}`);

} catch (error) {
  core.setFailed(error.message);
}