import * as core from "@actions/core";

async function fetchClients(apiKey) {
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
    if (!data.Clients || !Array.isArray(data.Clients)) {
      throw new Error("Response does not contain a valid 'Clients' array");
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

  core.info("Fetching Clients...");

  // Fetch Clients using the API key
  const Clients = await fetchClients(apiKey);
  
  core.info(`Successfully fetched ${Clients.length || 0} Clients`);
  
  // Set outputs for matrix strategy
  core.setOutput("Clients", JSON.stringify({ include: Clients }));
  
  // Log the Clients for debugging
  core.info(`Clients: ${JSON.stringify(Clients, null, 2)}`);

} catch (error) {
  core.setFailed(error.message);
}