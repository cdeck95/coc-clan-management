import { ClanWarLeagueGroup, ClanWarLeagueWar } from "@/types/clash";

// Base URL for Clash of Clans API
const baseUrl = process.env.COC_API_URL || "https://api.clashofclans.com/v1";

// Helper function for API calls
async function callClashApi<T>(endpoint: string): Promise<T> {
  const apiKey = process.env.COC_API_KEY;

  if (!apiKey) {
    throw new Error("Clash of Clans API key not found");
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store", // Ensures fresh data
  });

  if (!response.ok) {
    throw new Error(
      `Clash API Error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// Get Clan War League Group
export async function getClanWarLeagueGroup(
  clanTag: string
): Promise<ClanWarLeagueGroup> {
  try {
    return await callClashApi<ClanWarLeagueGroup>(
      `/clans/%23${clanTag}/currentwar/leaguegroup`
    );
  } catch (error) {
    console.error("Error fetching CWL group:", error);
    // Return an empty object that matches the ClanWarLeagueGroup type
    // Use casting to avoid type errors with empty response
    return {
      state: "",
      season: "",
      clans: [],
      rounds: [],
    } as ClanWarLeagueGroup;
  }
}

// Get Clan War League War
export async function getClanWarLeagueWar(
  warTag: string
): Promise<ClanWarLeagueWar> {
  try {
    // Remove # if included
    const tag = warTag.startsWith("#") ? warTag.substring(1) : warTag;
    return await callClashApi<ClanWarLeagueWar>(
      `/clanwarleagues/wars/%23${tag}`
    );
  } catch (error) {
    console.error(`Error fetching CWL war ${warTag}:`, error);
    throw error;
  }
}
