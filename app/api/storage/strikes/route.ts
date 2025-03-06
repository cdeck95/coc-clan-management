import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { MemberStrike } from "@/types/clash";

const bucketName = process.env.S3_BUCKET_NAME || "clash-data";
const region = process.env.REGION || "us-east-1";

// Create S3 client with server-side credentials
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID || "",
    secretAccessKey: process.env.SECRET_ACCESS_KEY || "",
  },
});

const STRIKES_PREFIX = "strikes/";

// GET all strikes
export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: STRIKES_PREFIX,
    });

    const response = await s3Client.send(command);
    const objects = response.Contents || [];

    const strikes: MemberStrike[] = [];

    // Process strikes in parallel for better performance
    await Promise.all(
      objects.map(async (object) => {
        if (!object.Key) return;

        try {
          const getCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: object.Key,
          });

          const response = await s3Client.send(getCommand);
          const bodyContents = await response.Body?.transformToString();

          if (bodyContents) {
            const strike = JSON.parse(bodyContents) as MemberStrike;
            strikes.push(strike);
          }
        } catch (error) {
          console.error(`Error fetching strike ${object.Key}:`, error);
          // Continue processing other strikes
        }
      })
    );

    return NextResponse.json(strikes);
  } catch (error) {
    console.error("Error listing strikes:", error);
    return NextResponse.json(
      { error: "Failed to fetch strikes" },
      { status: 500 }
    );
  }
}

// POST a new strike
export async function POST(request: NextRequest) {
  try {
    const strike = (await request.json()) as MemberStrike;

    // Validate the strike
    if (!strike.id || !strike.memberId || !strike.reason) {
      return NextResponse.json(
        { error: "Invalid strike data" },
        { status: 400 }
      );
    }

    const key = `${STRIKES_PREFIX}${strike.id}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(strike),
      ContentType: "application/json",
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true, strike });
  } catch (error) {
    console.error("Error saving strike:", error);
    return NextResponse.json(
      { error: "Failed to save strike" },
      { status: 500 }
    );
  }
}

// DELETE a strike by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const strikeId = searchParams.get("id");

    if (!strikeId) {
      return NextResponse.json(
        { error: "Strike ID is required" },
        { status: 400 }
      );
    }

    const key = `${STRIKES_PREFIX}${strikeId}`;

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting strike:", error);
    return NextResponse.json(
      { error: "Failed to delete strike" },
      { status: 500 }
    );
  }
}
