import { NextRequest, NextResponse } from "next/server";
import { ClanWarLeagueWar, ClanWarLeagueRound } from "@/types/clash";
import { fetchFromAPI, getWarLeagueGroup } from "@/lib/api";

// Fetch a single CWL war directly via fetchFromAPI (no internal HTTP hop)
async function fetchWarDirect(
  warTag: string,
  maxRetries: number = 2,
): Promise<ClanWarLeagueWar | null> {
  const encodedTag = encodeURIComponent(warTag);
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const war = await fetchFromAPI(`/clanwarleagues/wars/${encodedTag}`);
      // Validate that the response is actually war data (not mock clan data on error)
      if (war && war.clan && war.opponent) {
        return war as ClanWarLeagueWar;
      }
      console.warn(
        `War ${warTag} attempt ${attempt}: response missing clan/opponent fields`,
      );
    } catch (error) {
      console.error(
        `Failed to fetch war ${warTag} (attempt ${attempt}):`,
        error,
      );
    }
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 300));
    }
  }
  return null;
}

// Helper function to process wars in smaller batches to avoid timeouts
async function fetchWarsInBatches(
  warTags: string[],
  batchSize: number = 5,
  delayMs: number = 100,
): Promise<Record<string, ClanWarLeagueWar>> {
  const warData: Record<string, ClanWarLeagueWar> = {};
  const validTags = warTags.filter((tag) => tag && tag !== "#0");

  console.log(
    `Processing ${validTags.length} war tags in batches of ${batchSize}`,
  );

  for (let i = 0; i < validTags.length; i += batchSize) {
    const batch = validTags.slice(i, i + batchSize);
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        validTags.length / batchSize,
      )}: ${batch.length} wars`,
    );

    try {
      const batchResults = await Promise.all(
        batch.map(async (tag) => ({ tag, war: await fetchWarDirect(tag) })),
      );

      batchResults.forEach(({ tag, war }) => {
        if (war) {
          warData[tag] = war;
        }
      });

      if (i + batchSize < validTags.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Error processing batch starting at index ${i}:`, error);
    }
  }

  console.log(
    `Successfully fetched ${Object.keys(warData).length}/${validTags.length} wars`,
  );
  return warData;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { clanTag, fetchWars = true, timeout = 12000 } = await request.json();

    if (!clanTag) {
      return NextResponse.json(
        { error: "Invalid request. Expected clanTag." },
        { status: 400 },
      );
    }

    // Clean clan tag by removing # if present
    const cleanClanTag = clanTag.replace("#", "");

    console.log(`Fetching CWL data for clan: ${cleanClanTag}`);

    // Fetch CWL group data
    const leagueGroup = await getWarLeagueGroup(cleanClanTag);

    if (
      !leagueGroup ||
      !leagueGroup.rounds ||
      leagueGroup.rounds.length === 0
    ) {
      // No CWL group found or no rounds - return just the group data
      console.log("No CWL group found or no rounds");
      return NextResponse.json({ group: leagueGroup || null, wars: {} });
    }

    // If fetchWars is false, just return the group
    if (!fetchWars) {
      console.log("Skipping war data fetch as requested");
      return NextResponse.json({ group: leagueGroup, wars: {} });
    }

    // Collect all war tags from all rounds
    const allWarTags: string[] = [];
    leagueGroup.rounds.forEach((round: ClanWarLeagueRound) => {
      if (round && round.warTags) {
        allWarTags.push(...round.warTags.filter((tag) => tag && tag !== "#0"));
      }
    });

    console.log(`Found ${allWarTags.length} war tags to fetch`);

    let warData: Record<string, ClanWarLeagueWar> = {};

    if (allWarTags.length > 0) {
      // Check if we're approaching timeout
      const elapsedTime = Date.now() - startTime;
      const remainingTime = timeout - elapsedTime;

      if (remainingTime < 2000) {
        console.warn("Approaching timeout, returning partial data");
        return NextResponse.json({
          group: leagueGroup,
          wars: warData,
          warning: "Partial data due to timeout",
        });
      }

      // Use batched approach for better reliability
      warData = await fetchWarsInBatches(allWarTags, 5, 100);

      // Log completion stats
      const fetchTime = Date.now() - startTime;
      console.log(`War data fetch completed in ${fetchTime}ms`);
      console.log(
        `Successfully fetched ${Object.keys(warData).length}/${
          allWarTags.length
        } wars`,
      );
    }

    // Return both the group and all war data
    return NextResponse.json({
      group: leagueGroup,
      wars: warData,
      stats: {
        totalWars: allWarTags.length,
        fetchedWars: Object.keys(warData).length,
        processingTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(
      `Error fetching batch war league data after ${processingTime}ms:`,
      error,
    );

    return NextResponse.json(
      {
        error: `Failed to fetch war league data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        processingTime,
      },
      { status: 500 },
    );
  }
}
