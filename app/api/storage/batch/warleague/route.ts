import { NextRequest, NextResponse } from "next/server";
import { ClanWarLeagueWar, ClanWarLeagueRound } from "@/types/clash";
import { getWarLeagueGroup, getWarLeagueWar } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const { clanTag, fetchWars = true } = await request.json();

    if (!clanTag) {
      return NextResponse.json(
        { error: "Invalid request. Expected clanTag." },
        { status: 400 }
      );
    }

    // Clean clan tag by removing # if present
    const cleanClanTag = clanTag.replace("#", ""); // Fetch CWL group data
    const leagueGroup = await getWarLeagueGroup(cleanClanTag);

    if (
      !leagueGroup ||
      !leagueGroup.rounds ||
      leagueGroup.rounds.length === 0
    ) {
      // No CWL group found or no rounds - return just the group data
      return NextResponse.json({ group: leagueGroup || null, wars: {} });
    }

    // If fetchWars is false, just return the group
    if (!fetchWars) {
      return NextResponse.json({ group: leagueGroup, wars: {} });
    } // Collect all war tags
    const allWarTags: string[] = [];
    leagueGroup.rounds.forEach((round: ClanWarLeagueRound) => {
      if (round && round.warTags) {
        allWarTags.push(...round.warTags.filter(Boolean));
      }
    });

    // Fetch all wars in parallel
    const warData: Record<string, ClanWarLeagueWar> = {};

    if (allWarTags.length > 0) {
      const warPromises = allWarTags.map((tag) => getWarLeagueWar(tag));
      const wars = await Promise.all(warPromises);

      // Create a map of war tag to war data
      allWarTags.forEach((tag, index) => {
        if (tag && wars[index]) {
          warData[tag] = wars[index];
        }
      });
    }

    // Return both the group and all war data
    return NextResponse.json({
      group: leagueGroup,
      wars: warData,
    });
  } catch (error) {
    console.error(`Error fetching batch war league data:`, error);
    return NextResponse.json(
      { error: `Failed to fetch war league data` },
      { status: 500 }
    );
  }
}
