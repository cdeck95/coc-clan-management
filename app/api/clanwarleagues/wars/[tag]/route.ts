import { fetchFromClashAPI } from "@/lib/clash-api";
import { NextRequest, NextResponse } from "next/server";

type tParams = Promise<{ tag: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    // Await params to fix the error
    const warTag = (await params).tag;
    const data = await fetchFromClashAPI(
      `/clanwarleagues/wars/${encodeURIComponent(warTag)}`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching war league war:", error);
    return NextResponse.json(
      { error: "Failed to fetch war league war" },
      { status: 500 }
    );
  }
}
