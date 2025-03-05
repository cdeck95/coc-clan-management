import { fetchFromClashAPI } from "@/lib/clash-api";
import { NextRequest, NextResponse } from "next/server";

type tParams = Promise<{ tag: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    // Await params to fix the error
    const tag = (await params).tag;
    // Add the # back to the tag for the Clash API
    const clanTag = `#${tag}`;
    const data = await fetchFromClashAPI(
      `/clans/${encodeURIComponent(clanTag)}/currentwar`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching current war:", error);
    return NextResponse.json(
      { error: "Failed to fetch current war" },
      { status: 500 }
    );
  }
}
