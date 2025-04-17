import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { MemberNote } from "@/types/clash";

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

const NOTES_PREFIX = "notes/";

// Fixed type definition - params are not a Promise in Next.js App Router
type tParams = Promise<{ memberId: string }>;

// GET notes for a specific member
export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    // Await params to fix the error
    const memberId = (await params).memberId;

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
    console.error(`Error fetching notes for member`, error);
    return NextResponse.json(
      { error: `Failed to fetch notes for member` },
      { status: 500 }
    );
  }
}

// PUT to update a note for a specific member
export async function PUT(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const memberId = (await params).memberId;
    const note = (await request.json()) as MemberNote;

    // Validate the note
    if (!note.id || !note.memberId || !note.note) {
      return NextResponse.json({ error: "Invalid note data" }, { status: 400 });
    }

    // Ensure the memberId in the URL matches the one in the body
    if (memberId !== note.memberId) {
      return NextResponse.json(
        { error: "Member ID mismatch between URL and body" },
        { status: 400 }
      );
    }

    const key = `${NOTES_PREFIX}${note.id}`;

    // Check if note exists before updating
    try {
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      await s3Client.send(getCommand);
    } catch (error: unknown) {
      console.log("Error fetching note:", error);
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(note),
      ContentType: "application/json",
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

// DELETE a note for a specific member
export async function DELETE(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const memberId = (await params).memberId;
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("id");

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    // Check if the note exists and belongs to this member
    const key = `${NOTES_PREFIX}${noteId}`;

    try {
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const response = await s3Client.send(getCommand);
      const bodyContents = await response.Body?.transformToString();

      if (bodyContents) {
        const note = JSON.parse(bodyContents) as MemberNote;

        // Verify the note belongs to this member
        if (note.memberId !== memberId) {
          return NextResponse.json(
            { error: "Note does not belong to this member" },
            { status: 403 }
          );
        }
      }
    } catch (error: unknown) {
      console.log("Error deleting note:", error);
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Delete the note
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(deleteCommand);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
