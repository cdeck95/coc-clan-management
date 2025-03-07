import { fetchFromAPI } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

type tParams = Promise<{ tag: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    console.log("API route: Fetching war league war...");
    // Await params to fix the error
    const warTag = (await params).tag;
    console.log("API route: War tag:", warTag);
    const data = await fetchFromAPI(
      `/clanwarleagues/wars/${encodeURIComponent(warTag)}`
    );
    console.log("API route: War league war data received");
    return NextResponse.json(data);
  } catch (error) {
    console.error("API route: Error fetching war league war:", error);
    return NextResponse.json(
      { error: "Failed to fetch war league war" },
      { status: 500 }
    );
  }
}
