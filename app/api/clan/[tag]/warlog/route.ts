import { fetchFromAPI } from "@/lib/api";
import { WarLogEntry } from "@/types/clash";
import { NextRequest, NextResponse } from "next/server";

type tParams = Promise<{ tag: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    // console.log("API route: Fetching war log...");
    // Await params to fix the error
    const tag = (await params).tag;
    // console.log("API route: Clan tag:", tag);
    // Add the # back to the tag for the Clash API
    const clanTag = `#${tag}`;
    // console.log("API route: Clan tag with #:", clanTag);
    const data = await fetchFromAPI(
      `/clans/${encodeURIComponent(clanTag)}/warlog`
    );

    const warLogEntries = data.items as WarLogEntry[];
    // filter out if attacks per member is 1, that is not a normal war
    const filteredEntries = warLogEntries.filter(
      (entry) => entry.attacksPerMember > 1
    );

    return NextResponse.json(filteredEntries);
  } catch (error) {
    console.error("API route: Error fetching war log:", error);
    return NextResponse.json(
      { error: "Failed to fetch war log" },
      { status: 500 }
    );
  }
}
