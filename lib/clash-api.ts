// Base function for accessing the Clash of Clans API
import { getClashApiToken } from "@/lib/clash-token-manager";

const COC_API_BASE_URL = "https://api.clashofclans.com/v1";

export async function fetchFromClashAPI(endpoint: string) {
  console.debug("fetchFromClashAPI: Called with endpoint", endpoint);

  try {
    // Try to get a dynamically managed token first
    const apiToken = await getClashApiToken();
    console.debug(`fetchFromClashAPI: Got token of length ${apiToken.length}`);

    const url = `${COC_API_BASE_URL}${
      endpoint.startsWith("/") ? endpoint : "/" + endpoint
    }`;
    console.debug("fetchFromClashAPI: Request URL", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: "application/json",
      },
      cache: "no-store", // Disable cache to always get fresh data
    });

    console.debug(`fetchFromClashAPI: Response status ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.debug(`fetchFromClashAPI: Error response body: ${errorText}`);
      throw new Error(
        `API request failed with status ${response.status}: ${errorText}`
      );
    }

    const responseJson = await response.json();
    console.debug("fetchFromClashAPI: Response data received");

    return responseJson;
  } catch (error) {
    console.error("fetchFromClashAPI: Error occurred", error);
    throw error;
  }
}
