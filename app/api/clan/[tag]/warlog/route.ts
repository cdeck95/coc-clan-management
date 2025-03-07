import { fetchFromAPI } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

type tParams = Promise<{ tag: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    console.log("API route: Fetching war log...");
    // Await params to fix the error
    const tag = (await params).tag;
    console.log("API route: Clan tag:", tag);
    // Add the # back to the tag for the Clash API
    const clanTag = `#${tag}`;
    console.log("API route: Clan tag with #:", clanTag);
    const data = await fetchFromAPI(
      `/clans/${encodeURIComponent(clanTag)}/warlog`
    );
    console.log("API route: War log data received");
    return NextResponse.json(data);
  } catch (error) {
    console.error("API route: Error fetching war log:", error);
    return NextResponse.json(
      { error: "Failed to fetch war log" },
      { status: 500 }
    );
  }
}
