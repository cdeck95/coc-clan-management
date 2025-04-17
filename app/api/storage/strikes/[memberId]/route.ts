import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
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

// Fixed type definition - params are not a Promise in Next.js App Router
type tParams = Promise<{ memberId: string }>;

// GET strikes for a specific member
export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    // Await params to fix the error
    const memberId = (await params).memberId;

    // First get all strikes
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: STRIKES_PREFIX,
    });

    const response = await s3Client.send(command);
    const objects = response.Contents || [];

    const allStrikes: MemberStrike[] = [];

    // Process strikes in parallel
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
            allStrikes.push(strike);
          }
        } catch (error) {
          console.error(`Error fetching strike ${object.Key}:`, error);
          // Continue processing other strikes
        }
      })
    );

    // Filter strikes for the specific member
    const memberStrikes = allStrikes.filter(
      (strike) => strike.memberId === memberId
    );

    return NextResponse.json(memberStrikes);
  } catch (error) {
    console.error(`Error fetching strikes for member`, error);
    return NextResponse.json(
      { error: `Failed to fetch strikes for member` },
      { status: 500 }
    );
  }
}

// PUT to update a strike for a specific member
export async function PUT(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    // Await params to fix the error
    const memberId = (await params).memberId;
    const strike = (await request.json()) as MemberStrike;

    // Validate the strike
    if (!strike.id || !strike.memberId || !strike.reason) {
      return NextResponse.json(
        { error: "Invalid strike data" },
        { status: 400 }
      );
    }

    // Ensure the memberId in the URL matches the one in the body
    if (memberId !== strike.memberId) {
      return NextResponse.json(
        { error: "Member ID mismatch between URL and body" },
        { status: 400 }
      );
    }

    const key = `${STRIKES_PREFIX}${strike.id}`;

    // Check if strike exists before updating
    try {
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      await s3Client.send(getCommand);
    } catch (error: unknown) {
      console.log("Error editing strike:", error);
      return NextResponse.json({ error: "Strike not found" }, { status: 404 });
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(strike),
      ContentType: "application/json",
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true, strike });
  } catch (error) {
    console.error("Error updating strike:", error);
    return NextResponse.json(
      { error: "Failed to update strike" },
      { status: 500 }
    );
  }
}

// DELETE a strike for a specific member
export async function DELETE(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    // Await params to fix the error
    const memberId = (await params).memberId;
    const { searchParams } = new URL(request.url);
    const strikeId = searchParams.get("id");

    if (!strikeId) {
      return NextResponse.json(
        { error: "Strike ID is required" },
        { status: 400 }
      );
    }

    // Check if the strike exists and belongs to this member
    const key = `${STRIKES_PREFIX}${strikeId}`;

    try {
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const response = await s3Client.send(getCommand);
      const bodyContents = await response.Body?.transformToString();

      if (bodyContents) {
        const strike = JSON.parse(bodyContents) as MemberStrike;

        // Verify the strike belongs to this member
        if (strike.memberId !== memberId) {
          return NextResponse.json(
            { error: "Strike does not belong to this member" },
            { status: 403 }
          );
        }
      }
    } catch (error: unknown) {
      console.log("Error deleting strike:", error);
      return NextResponse.json({ error: "Strike not found" }, { status: 404 });
    }

    // Delete the strike
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(deleteCommand);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting strike:", error);
    return NextResponse.json(
      { error: "Failed to delete strike" },
      { status: 500 }
    );
  }
}
