import { NextRequest, NextResponse } from "next/server";
import { fetchFromClashAPI } from "@/lib/clash-api";

export async function GET(
  request: NextRequest,
  { params }: { params: { tag: string } }
) {
  try {
    // Await params to fix the error
    const tag = (await params).tag;
    // Add the # back to the tag for the Clash API
    const clanTag = `#${tag}`;
    const data = await fetchFromClashAPI(
      `/clans/${encodeURIComponent(clanTag)}/currentwar/leaguegroup`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching league group:", error);
    return NextResponse.json(
      { error: "Failed to fetch league group" },
      { status: 500 }
    );
  }
}
