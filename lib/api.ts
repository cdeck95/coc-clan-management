"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Clan,
  CurrentWar,
  MemberNote,
  MemberStrike,
  AttackEfficiency,
  BannedMember,
  ClanWarLeagueGroup,
  ClanWarLeagueWar,
  League,
  WarLeague,
  LeagueSeason,
  LeagueSeasonRanking,
  WarLogEntry,
} from "@/types/clash";
import { getObject, putObject, listObjects } from "@/lib/aws-client";
import {
  MOCK_CLAN_DATA,
  MOCK_WAR_DATA,
  MOCK_CWL_GROUP_DATA,
} from "@/lib/mock-data";
import { getClashApiToken } from "@/lib/clash-token-manager";

// Base URL for the Clash of Clans API
const API_BASE_URL = "https://api.clashofclans.com/v1";
const CLAN_TAG = process.env.NEXT_PUBLIC_CLAN_TAG || "#GCVL29VJ";

// S3 key prefixes
const EFFICIENCY_PREFIX = "efficiency/";

// Helper for debug logging
const DEBUG = true;
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log(...args);
  }
}

// Helper function to encode special characters in tags
const encodeTag = (tag: string) => {
  return encodeURIComponent(tag);
};

// Server-side API calls
export async function fetchFromAPI(endpoint: string) {
  let apiToken;

  try {
    // Try to get a dynamically managed token first
    apiToken = await getClashApiToken();
  } catch (error) {
    console.error("Error getting dynamic token:", error);
    // Fall back to static token
    apiToken = process.env.CLASH_API_TOKEN;
  }

  if (!apiToken) {
    console.warn("No API token provided, using mock data");
    // Return mock data based on endpoint
    if (endpoint.includes("currentwar")) {
      return MOCK_WAR_DATA;
    }
    return MOCK_CLAN_DATA;
  }

  try {
    console.log(`Fetching from ${API_BASE_URL}${endpoint}`);
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    const responseJson = await res.json();
    console.log("Response from API:", responseJson);

    if (!res.ok) {
      console.error(`API error: ${res.status} - ${await res.text()}`);

      // Return mock data if API call fails
      if (endpoint.includes("currentwar")) {
        return MOCK_WAR_DATA;
      }
      return MOCK_CLAN_DATA;
    }

    return await responseJson;
  } catch (error) {
    console.error("Error fetching from Clash API:", error);

    // Return mock data on error
    if (endpoint.includes("currentwar")) {
      return MOCK_WAR_DATA;
    }
    return MOCK_CLAN_DATA;
  }
}

export async function getClanInfo(): Promise<Clan> {
  const encodedTag = encodeTag(CLAN_TAG);
  return fetchFromAPI(`/clans/${encodedTag}`);
}

// New enhanced War League API functions
export async function getCurrentWarLeague(): Promise<ClanWarLeagueGroup> {
  const encodedTag = encodeTag(CLAN_TAG);

  try {
    const data = await fetchFromAPI(`/clans/${encodedTag}/currentwarleague`);
    return data;
  } catch (error) {
    console.error("Error fetching CWL data:", error);
    return MOCK_CWL_GROUP_DATA;
  }
}

// export async function getWarLeagueWar(
//   warTag: string
// ): Promise<ClanWarLeagueWar> {
//   try {
//     const encodedWarTag = encodeTag(warTag);
//     const data = await fetchFromAPI(`/clanwarleagues/wars/${encodedWarTag}`);
//     return data;
//   } catch (error) {
//     console.error(`Error fetching CWL war data for tag ${warTag}:`, error);
//     return MOCK_WAR_DATA as ClanWarLeagueWar;
//   }
// }

// Additional War League API functions
export async function listWarLeagues(): Promise<WarLeague[]> {
  try {
    const data = await fetchFromAPI("/warleagues");
    return data.items || [];
  } catch (error) {
    console.error("Error fetching war leagues:", error);
    return [];
  }
}

export async function getWarLeagueInfo(leagueId: number): Promise<WarLeague> {
  try {
    const data = await fetchFromAPI(`/warleagues/${leagueId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching war league info for ID ${leagueId}:`, error);
    throw error;
  }
}

// Regular Leagues API functions
export async function listLeagues(): Promise<League[]> {
  try {
    const data = await fetchFromAPI("/leagues");
    return data.items || [];
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return [];
  }
}

export async function getLeagueInfo(leagueId: number): Promise<League> {
  try {
    const data = await fetchFromAPI(`/leagues/${leagueId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching league info for ID ${leagueId}:`, error);
    throw error;
  }
}

export async function getLeagueSeasons(
  leagueId: number
): Promise<LeagueSeason[]> {
  try {
    const data = await fetchFromAPI(`/leagues/${leagueId}/seasons`);
    return data.items || [];
  } catch (error) {
    console.error(
      `Error fetching league seasons for league ID ${leagueId}:`,
      error
    );
    return [];
  }
}

export async function getLeagueSeasonRankings(
  leagueId: number,
  seasonId: string
): Promise<LeagueSeasonRanking[]> {
  try {
    const data = await fetchFromAPI(`/leagues/${leagueId}/seasons/${seasonId}`);
    return data.items || [];
  } catch (error) {
    console.error(
      `Error fetching league season rankings for league ${leagueId}, season ${seasonId}:`,
      error
    );
    return [];
  }
}

// S3 storage functions for notes and strikes

// Notes - Updated for server-side API
export async function getMemberNotes(): Promise<MemberNote[]> {
  try {
    debugLog("Getting all member notes via API");
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL("/api/storage/notes", baseUrl);
    console.log("Fetching notes from:", url.toString());
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notes: ${response.status}`);
    }

    const notes = await response.json();
    debugLog(`Found ${notes.length} total notes`);
    return notes;
  } catch (error) {
    console.error("Error getting member notes:", error);
    return []; // Return empty array on error
  }
}

export async function saveMemberNote(note: MemberNote): Promise<void> {
  try {
    debugLog("Saving note via API:", note);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    console.log("Base URL:", baseUrl);
    const url = new URL("/api/storage/notes", baseUrl);
    console.log("Saving note to:", url.toString());

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to save note: ${errorData.error || response.status}`
      );
    }

    debugLog("Note saved successfully");
  } catch (error) {
    console.error("Error saving member note:", error);
    throw error;
  }
}

export async function deleteMemberNote(noteId: string): Promise<void> {
  try {
    debugLog(`Deleting note ${noteId} via API`);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL(`/api/storage/notes?id=${noteId}`, baseUrl);
    console.log("Deleting note from:", url.toString());

    const response = await fetch(url.toString(), {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to delete note: ${errorData.error || response.status}`
      );
    }

    debugLog("Note deleted successfully");
  } catch (error) {
    console.error("Error deleting member note:", error);
    throw error;
  }
}

export async function getMemberNotesByMemberId(
  memberId: string
): Promise<MemberNote[]> {
  try {
    debugLog(`Getting notes for member ${memberId} via API`);

    const encodedMemberId = encodeURIComponent(memberId);
    console.log("Encoded member ID:", encodedMemberId);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    console.log("baseUrl:", baseUrl);
    const url = new URL(`/api/storage/notes/${encodedMemberId}`, baseUrl);
    console.log("Fetching notes from:", url.toString());
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notes for member: ${response.status}`);
    }

    const notes = await response.json();
    debugLog(`Found ${notes.length} notes for member ${memberId}`);
    return notes;
  } catch (error) {
    console.error(`Error getting notes for member ${memberId}:`, error);
    return []; // Return empty array on error
  }
}

export async function updateMemberNote(note: MemberNote): Promise<void> {
  try {
    debugLog("Updating note via API:", note);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL(
      `/api/storage/notes/${encodeURIComponent(note.memberId)}`,
      baseUrl
    );
    console.log("Updating note at:", url.toString());

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to update note: ${errorData.error || response.status}`
      );
    }

    debugLog("Note updated successfully");
  } catch (error) {
    console.error("Error updating member note:", error);
    throw error;
  }
}

// Strikes - Updated for server-side API
export async function getMemberStrikes(): Promise<MemberStrike[]> {
  try {
    debugLog("Getting all member strikes via API");
    // Use an environment variable or fallback URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL(`/api/storage/strikes`, baseUrl);
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch strikes: ${response.status}`);
    }

    const strikes = await response.json();
    debugLog(`Found ${strikes.length} total strikes`);
    return strikes;
  } catch (error) {
    console.error("Error getting member strikes:", error);
    return []; // Return empty array on error
  }
}

export async function saveMemberStrike(strike: MemberStrike): Promise<void> {
  try {
    debugLog("Saving strike via API:", strike);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/storage/strikes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(strike),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to save strike: ${errorData.error || response.status}`
      );
    }

    debugLog("Strike saved successfully");
  } catch (error) {
    console.error("Error saving member strike:", error);
    throw error;
  }
}

export async function deleteMemberStrike(strikeId: string): Promise<void> {
  try {
    debugLog(`Deleting strike ${strikeId} via API`);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/api/storage/strikes?id=${strikeId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to delete strike: ${errorData.error || response.status}`
      );
    }

    debugLog("Strike deleted successfully");
  } catch (error) {
    console.error("Error deleting member strike:", error);
    throw error;
  }
}

export async function getMemberStrikesByMemberId(
  memberId: string
): Promise<MemberStrike[]> {
  try {
    debugLog(`Getting strikes for member ${memberId} via API`);

    const encodedMemberId = encodeURIComponent(memberId);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    console.log(
      "Fetching strikes from:",
      `${baseUrl}/api/storage/strikes/${encodedMemberId}`
    );

    const url = new URL(`/api/storage/strikes/${encodedMemberId}`, baseUrl);
    console.log("Fetching strikes from:", url.toString());
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch strikes for member: ${response.status}`);
    }

    const strikes = await response.json();
    debugLog(`Found ${strikes.length} strikes for member ${memberId}`);
    return strikes;
  } catch (error) {
    console.error(`Error getting strikes for member ${memberId}:`, error);
    return []; // Return empty array on error
  }
}

export async function updateMemberStrike(strike: MemberStrike): Promise<void> {
  try {
    debugLog("Updating strike via API:", strike);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL(
      `/api/storage/strikes/${encodeURIComponent(strike.memberId)}`,
      baseUrl
    );

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(strike),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to update strike: ${errorData.error || response.status}`
      );
    }

    debugLog("Strike updated successfully");
  } catch (error) {
    console.error("Error updating member strike:", error);
    throw error;
  }
}

// Attack Efficiency tracking functions
export async function getMemberEfficiencies(): Promise<AttackEfficiency[]> {
  try {
    const objects: { Key?: string }[] = await listObjects(EFFICIENCY_PREFIX);
    const efficiencies: AttackEfficiency[] = [];

    for (const object of objects) {
      if (object.Key) {
        const efficiency = (await getObject(object.Key)) as AttackEfficiency;
        if (efficiency) {
          efficiencies.push(efficiency);
        }
      }
    }

    return efficiencies;
  } catch (error) {
    console.error("Error getting member efficiencies:", error);
    return [];
  }
}

export async function saveMemberEfficiency(
  efficiency: AttackEfficiency
): Promise<void> {
  try {
    const key = `${EFFICIENCY_PREFIX}${efficiency.memberId}`;
    await putObject(key, efficiency);
  } catch (error) {
    console.error("Error saving member efficiency:", error);
    throw error;
  }
}

export async function getMemberEfficiencyById(
  memberId: string
): Promise<AttackEfficiency | null> {
  try {
    const key = `${EFFICIENCY_PREFIX}${memberId}`;
    return await getObject(key);
  } catch (error) {
    console.error(`Error getting efficiency for member ${memberId}:`, error);
    return null;
  }
}

export async function updateEfficiencyFromWar(
  warData: CurrentWar | ClanWarLeagueWar
): Promise<void> {
  try {
    const clan = warData.clan;

    // Process each member with attacks
    for (const member of clan.members) {
      if (member.attacks && member.attacks.length > 0) {
        // Get existing efficiency data or create new
        const efficiency = (await getMemberEfficiencyById(member.tag)) || {
          memberId: member.tag,
          memberName: member.name,
          totalAttacks: 0,
          totalStars: 0,
          totalDestruction: 0,
          averageStars: 0,
          averageDestruction: 0,
          threeStarRate: 0,
          lastUpdated: new Date().toISOString(),
        };

        // Update with new attacks
        const newAttackCount = member.attacks.length;
        const newStars = member.attacks.reduce(
          (sum, attack) => sum + attack.stars,
          0
        );
        const newDestruction = member.attacks.reduce(
          (sum, attack) => sum + attack.destructionPercentage,
          0
        );
        const threeStarAttacks = member.attacks.filter(
          (attack) => attack.stars === 3
        ).length;

        // Recalculate stats
        efficiency.totalAttacks += newAttackCount;
        efficiency.totalStars += newStars;
        efficiency.totalDestruction += newDestruction;
        efficiency.averageStars =
          efficiency.totalAttacks > 0
            ? efficiency.totalStars / efficiency.totalAttacks
            : 0;
        efficiency.averageDestruction =
          efficiency.totalAttacks > 0
            ? efficiency.totalDestruction / efficiency.totalAttacks
            : 0;
        efficiency.threeStarRate =
          efficiency.totalAttacks > 0
            ? (threeStarAttacks / efficiency.totalAttacks) * 100
            : 0;
        efficiency.lastUpdated = new Date().toISOString();

        // Save updated efficiency
        await saveMemberEfficiency(efficiency);
      }
    }
  } catch (error) {
    console.error("Error updating efficiency data from war:", error);
  }
}

// Banned Members tracking
export async function getBannedMembers(): Promise<BannedMember[]> {
  try {
    debugLog("Getting all banned members via API");
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL("/api/storage/banned", baseUrl);

    console.log("Fetching banned members from:", url.toString());
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch banned members: ${response.status}`);
    }

    const bannedMembers = await response.json();
    debugLog(`Found ${bannedMembers.length} total banned members`);
    return bannedMembers;
  } catch (error) {
    console.error("Error getting banned members:", error);
    return []; // Return empty array on error
  }
}

export async function saveBannedMember(member: BannedMember): Promise<void> {
  try {
    debugLog("Saving banned member via API:", member);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL("/api/storage/banned", baseUrl);

    console.log("Saving banned member to:", url.toString());
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(member),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to save banned member: ${errorData.error || response.status}`
      );
    }

    debugLog("Banned member saved successfully");
  } catch (error) {
    console.error("Error saving banned member:", error);
    throw error;
  }
}

export async function removeBannedMember(id: string): Promise<void> {
  try {
    debugLog(`Deleting banned member ${id} via API`);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL(
      `/api/storage/banned/${encodeURIComponent(id)}`,
      baseUrl
    );

    console.log("Deleting banned member from:", url.toString());
    const response = await fetch(url.toString(), {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to delete banned member: ${errorData.error || response.status}`
      );
    }

    debugLog("Banned member deleted successfully");
  } catch (error) {
    console.error("Error deleting banned member:", error);
    throw error;
  }
}

export async function getBannedMemberById(
  id: string
): Promise<BannedMember | null> {
  try {
    debugLog(`Getting banned member ${id} via API`);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL(
      `/api/storage/banned/${encodeURIComponent(id)}`,
      baseUrl
    );

    console.log("Fetching banned member from:", url.toString());
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch banned member: ${response.status}`);
    }

    const bannedMember = await response.json();
    return bannedMember;
  } catch (error) {
    console.error(`Error getting banned member ${id}:`, error);
    return null;
  }
}

export async function updateBannedMember(member: BannedMember): Promise<void> {
  try {
    debugLog("Updating banned member via API:", member);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL(
      `/api/storage/banned/${encodeURIComponent(member.id)}`,
      baseUrl
    );

    console.log("Updating banned member at:", url.toString());
    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(member),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to update banned member: ${errorData.error || response.status}`
      );
    }

    debugLog("Banned member updated successfully");
  } catch (error) {
    console.error("Error updating banned member:", error);
    throw error;
  }
}

export async function isMemberBanned(
  tag: string
): Promise<BannedMember | null> {
  try {
    const bannedMembers = await getBannedMembers();
    return bannedMembers.find((member) => member.tag === tag) || null;
  } catch (error) {
    console.error(`Error checking if member ${tag} is banned:`, error);
    return null;
  }
}

/**
 * Checks if a member is on the banned list
 * @param memberId The tag of the member to check
 * @returns Object containing isBanned status and the banned member object if found
 */
export async function checkIfMemberIsBanned(memberId: string): Promise<{
  isBanned: boolean;
  bannedMember: BannedMember | null;
}> {
  try {
    // Get all banned members
    let bannedMembers: BannedMember[] = [];

    try {
      bannedMembers = await getBannedMembers();
    } catch (error) {
      // Log the error but continue with empty array
      console.error("Error fetching banned members list:", error);
      // Return early with default values if S3 is unavailable
      return {
        isBanned: false,
        bannedMember: null,
      };
    }

    // Find the member in the banned list
    const foundMember = bannedMembers.find(
      (banned) => banned.tag.toLowerCase() === memberId.toLowerCase()
    );

    return {
      isBanned: !!foundMember,
      bannedMember: foundMember || null,
    };
  } catch (error) {
    console.error("Error checking if member is banned:", error);
    return {
      isBanned: false,
      bannedMember: null,
    };
  }
}

// Clan War API functions
export async function getCurrentWar(clanTag: string) {
  try {
    // Remove # from the tag if present before encoding
    const cleanTag = clanTag.startsWith("#") ? clanTag.substring(1) : clanTag;
    // Use an environment variable or fallback URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL(`/api/clan/${cleanTag}/currentwar`, baseUrl);
    console.log("Fetching current war from:", url.toString());
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const responseJson = await response.json();
    console.log("Response from API:", responseJson);

    if (!response.ok) {
      throw new Error(`Failed to fetch current war: ${response.status}`);
    }

    return responseJson;
  } catch (error) {
    console.error("Error in getCurrentWar:", error);
    throw error;
  }
}

export async function getWarLeagueGroup(
  clanTag: string
): Promise<ClanWarLeagueGroup> {
  try {
    // Remove # from the tag if present before encoding
    const cleanTag = clanTag.startsWith("#") ? clanTag.substring(1) : clanTag;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL(
      `/api/clan/${cleanTag}/currentwar/leaguegroup`,
      baseUrl
    );
    console.log("Fetching current war league group from:", url.toString());
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const responseJson = await response.json();
    console.log("Response from API:", responseJson);
    if (!response.ok) throw new Error("Failed to fetch war league group");
    return responseJson;
  } catch (error) {
    console.error("Error in getWarLeagueGroup:", error);
    throw error;
  }
}

export async function getWarLog(clanTag: string): Promise<WarLogEntry[]> {
  try {
    // Remove # from the tag if present before encoding
    const cleanTag = clanTag.startsWith("#") ? clanTag.substring(1) : clanTag;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL(`/api/clan/${cleanTag}/warlog`, baseUrl);
    console.log("Fetching current war from:", url.toString());
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch war log");
    const warLogEntries: WarLogEntry[] = await response.json();
    return warLogEntries;
  } catch (error) {
    console.error("Error in getWarLog:", error);
    throw error;
  }
}

export async function getWarLeagueWar(warTag: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = new URL(
    `/api/clanwarleagues/wars/${encodeURIComponent(warTag)}`,
    baseUrl
  );
  console.log("Fetching current war from:", url.toString());
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Failed to fetch war league war");
  return response.json();
}

export async function fetchMembersData(
  memberIds: string[],
  options = { notes: true, strikes: true }
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL("/api/storage/batch", baseUrl);
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberIds,
        fetchNotes: options.notes,
        fetchStrikes: options.strikes,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch batch data: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching members data:", error);
    throw error;
  }
}

export async function fetchWarLeagueData(clanTag: string, fetchWars = true) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL("/api/storage/batch/warleague", baseUrl);
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clanTag,
        fetchWars,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch war league data: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching war league data:", error);
    throw error;
  }
}
