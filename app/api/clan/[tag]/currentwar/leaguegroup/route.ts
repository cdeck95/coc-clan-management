import { NextRequest, NextResponse } from "next/server";
import { fetchFromClashAPI } from "@/lib/clash-api";

type tParams = Promise<{ tag: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    console.log("API route: Fetching league group...");
    // Await params to fix the error
    const tag = (await params).tag;
    console.log("API route: Clan tag:", tag);
    // Add the # back to the tag for the Clash API
    const clanTag = `#${tag}`;
    console.log("API route: Clan tag with #:", clanTag);
    const data = await fetchFromClashAPI(
      `/clans/${encodeURIComponent(clanTag)}/currentwar/leaguegroup`
    );
    console.log("API route: League group data received");
    return NextResponse.json(data);
  } catch (error) {
    console.error("API route: Error fetching league group:", error);
    return NextResponse.json(
      { error: "Failed to fetch league group" },
      { status: 500 }
    );
  }
}
