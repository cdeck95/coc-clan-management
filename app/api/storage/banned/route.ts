import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { BannedMember } from "@/types/clash";

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

const BANNED_PREFIX = "banned/";

// GET all banned members
export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: BANNED_PREFIX,
    });

    const response = await s3Client.send(command);
    const objects = response.Contents || [];

    const bannedMembers: BannedMember[] = [];

    // Process banned members in parallel for better performance
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
            const bannedMember = JSON.parse(bodyContents) as BannedMember;
            bannedMembers.push(bannedMember);
          }
        } catch (error) {
          console.error(`Error fetching banned member ${object.Key}:`, error);
          // Continue processing other members
        }
      })
    );

    return NextResponse.json(bannedMembers);
  } catch (error) {
    console.error("Error listing banned members:", error);
    return NextResponse.json(
      { error: "Failed to fetch banned members" },
      { status: 500 }
    );
  }
}

// POST a new banned member
export async function POST(request: NextRequest) {
  try {
    const bannedMember = (await request.json()) as BannedMember;

    // Validate the banned member
    if (!bannedMember.id || !bannedMember.tag || !bannedMember.name) {
      return NextResponse.json(
        { error: "Invalid banned member data" },
        { status: 400 }
      );
    }

    const key = `${BANNED_PREFIX}${bannedMember.id}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(bannedMember),
      ContentType: "application/json",
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true, bannedMember });
  } catch (error) {
    console.error("Error saving banned member:", error);
    return NextResponse.json(
      { error: "Failed to save banned member" },
      { status: 500 }
    );
  }
}
