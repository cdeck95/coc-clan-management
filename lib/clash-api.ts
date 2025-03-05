// Base function for accessing the Clash of Clans API

const COC_API_BASE_URL = "https://api.clashofclans.com/v1";
const COC_API_KEY = process.env.CLASH_API_TOKEN;

export async function fetchFromClashAPI(endpoint: string) {
  if (!COC_API_KEY) {
    throw new Error("Clash of Clans API key is not defined");
  }

  const url = `${COC_API_BASE_URL}${
    endpoint.startsWith("/") ? endpoint : "/" + endpoint
  }`;
  console.log("----- url ------", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${COC_API_KEY}`,
      Accept: "application/json",
    },
    cache: "no-store", // Disable cache to always get fresh data
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      `API request failed with status ${response.status}: ${JSON.stringify(
        errorData
      )}`
    );
  }

  return response.json();
}
