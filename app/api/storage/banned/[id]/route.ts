import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
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

// Fixed type definition - params are not a Promise in Next.js App Router
type tParams = Promise<{ id: string }>;

// GET a specific banned member by ID
export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    // Await params to fix the error
    const id = (await params).id;

    if (!id) {
      return NextResponse.json(
        { error: "Banned member ID is required" },
        { status: 400 }
      );
    }

    const key = `${BANNED_PREFIX}${id}`;

    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(getCommand);
    const bodyContents = await response.Body?.transformToString();

    if (!bodyContents) {
      return NextResponse.json(
        { error: "Banned member not found" },
        { status: 404 }
      );
    }

    const bannedMember = JSON.parse(bodyContents) as BannedMember;
    return NextResponse.json(bannedMember);
  } catch (error) {
    console.error(`Error fetching banned member:`, error);
    return NextResponse.json(
      { error: "Failed to fetch banned member" },
      { status: 500 }
    );
  }
}

// DELETE a banned member by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const id = (await params).id;

    if (!id) {
      return NextResponse.json(
        { error: "Banned member ID is required" },
        { status: 400 }
      );
    }

    const key = `${BANNED_PREFIX}${id}`;

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting banned member:", error);
    return NextResponse.json(
      { error: "Failed to delete banned member" },
      { status: 500 }
    );
  }
}

// PUT to update a banned member
export async function PUT(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const id = (await params).id;
    const bannedMember = (await request.json()) as BannedMember;

    if (!id) {
      return NextResponse.json(
        { error: "Banned member ID is required" },
        { status: 400 }
      );
    }

    // Validate that the ID in the URL matches the one in the body
    if (id !== bannedMember.id) {
      return NextResponse.json(
        { error: "ID mismatch between URL and body" },
        { status: 400 }
      );
    }

    // Validate the banned member
    if (!bannedMember.tag || !bannedMember.name) {
      return NextResponse.json(
        { error: "Invalid banned member data" },
        { status: 400 }
      );
    }

    const key = `${BANNED_PREFIX}${id}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(bannedMember),
      ContentType: "application/json",
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true, bannedMember });
  } catch (error) {
    console.error("Error updating banned member:", error);
    return NextResponse.json(
      { error: "Failed to update banned member" },
      { status: 500 }
    );
  }
}
