"use server";

import { fetchFromClashAPI } from "@/lib/clash-api";
import { NextRequest, NextResponse } from "next/server";

type tParams = Promise<{ tag: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    console.log("API route: Fetching current war...");
    // Await params to fix the error
    const tag = (await params).tag;
    console.log("API route: Clan tag:", tag);
    // Add the # back to the tag for the Clash API
    const clanTag = `#${tag}`;
    console.log("API route: Clan tag with #:", clanTag);
    const data = await fetchFromClashAPI(
      `/clans/${encodeURIComponent(clanTag)}/currentwar`
    );
    console.log("API route: Current war data received");
    return NextResponse.json(data);
  } catch (error) {
    console.error("API route: Error fetching current war:", error);
    return NextResponse.json(
      { error: "Failed to fetch current war" },
      { status: 500 }
    );
  }
}
