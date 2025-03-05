import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { MemberNote } from "@/types/clash";

const bucketName = process.env.S3_BUCKET_NAME || "clash-data";
const region = process.env.AWS_REGION || "us-east-1";

// Create S3 client with server-side credentials
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const NOTES_PREFIX = "notes/";

// GET notes for a specific member
export async function GET(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const memberId = params.memberId;

    // First get all notes
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: NOTES_PREFIX,
    });

    const response = await s3Client.send(command);
    const objects = response.Contents || [];

    const allNotes: MemberNote[] = [];

    // Process notes in parallel
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
            const note = JSON.parse(bodyContents) as MemberNote;
            allNotes.push(note);
          }
        } catch (error) {
          console.error(`Error fetching note ${object.Key}:`, error);
          // Continue processing other notes
        }
      })
    );

    // Filter notes for the specific member
    const memberNotes = allNotes.filter((note) => note.memberId === memberId);

    return NextResponse.json(memberNotes);
  } catch (error) {
    console.error(`Error fetching notes for member ${params.memberId}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch notes for member ${params.memberId}` },
      { status: 500 }
    );
  }
}
