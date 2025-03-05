import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
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

// GET all notes
export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: NOTES_PREFIX,
    });

    const response = await s3Client.send(command);
    const objects = response.Contents || [];

    const notes: MemberNote[] = [];

    // Process notes in parallel for better performance
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
            notes.push(note);
          }
        } catch (error) {
          console.error(`Error fetching note ${object.Key}:`, error);
          // Continue processing other notes
        }
      })
    );

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error listing notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST a new note
export async function POST(request: NextRequest) {
  try {
    const note = (await request.json()) as MemberNote;

    // Validate the note
    if (!note.id || !note.memberId || !note.note) {
      return NextResponse.json({ error: "Invalid note data" }, { status: 400 });
    }

    const key = `${NOTES_PREFIX}${note.id}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(note),
      ContentType: "application/json",
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}

// DELETE a note by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("id");

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    const key = `${NOTES_PREFIX}${noteId}`;

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
