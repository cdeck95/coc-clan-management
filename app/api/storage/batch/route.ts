import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  _Object,
} from "@aws-sdk/client-s3";
import { MemberNote, MemberStrike } from "@/types/clash";

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
const STRIKES_PREFIX = "strikes/";

// Define types for clarity
type S3Object = _Object;
type MemberData = MemberNote | MemberStrike;

export async function POST(request: NextRequest) {
  try {
    const { memberIds, fetchNotes, fetchStrikes } = await request.json();

    if (!memberIds || !Array.isArray(memberIds)) {
      return NextResponse.json(
        { error: "Invalid request. Expected memberIds array." },
        { status: 400 }
      );
    }

    const results: Record<
      string,
      { notes?: MemberNote[]; strikes?: MemberStrike[] }
    > = {};

    // Initialize results object with empty arrays
    memberIds.forEach((id) => {
      results[id] = {};
    });

    // Fetch notes if requested
    if (fetchNotes) {
      // Get all notes in one request
      const notesCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: NOTES_PREFIX,
      });

      const notesResponse = await s3Client.send(notesCommand);
      const notesObjects = notesResponse.Contents || [];

      // Load all notes in parallel
      const allNotes: MemberNote[] = await loadObjectsInParallel<MemberNote>(
        notesObjects
      );

      // Group notes by member ID
      memberIds.forEach((memberId) => {
        results[memberId].notes = allNotes.filter(
          (note) => note.memberId === memberId
        );
      });
    }

    // Fetch strikes if requested
    if (fetchStrikes) {
      // Get all strikes in one request
      const strikesCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: STRIKES_PREFIX,
      });

      const strikesResponse = await s3Client.send(strikesCommand);
      const strikesObjects = strikesResponse.Contents || [];

      // Load all strikes in parallel
      const allStrikes: MemberStrike[] =
        await loadObjectsInParallel<MemberStrike>(strikesObjects);

      // Group strikes by member ID
      memberIds.forEach((memberId) => {
        results[memberId].strikes = allStrikes.filter(
          (strike) => strike.memberId === memberId
        );
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error(`Error fetching batch data:`, error);
    return NextResponse.json(
      { error: `Failed to fetch batch data` },
      { status: 500 }
    );
  }
}

// Helper function to load objects in parallel with generic typing
async function loadObjectsInParallel<T extends MemberData>(
  objects: S3Object[]
): Promise<T[]> {
  const allItems: T[] = [];

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
          const item = JSON.parse(bodyContents) as T;
          allItems.push(item);
        }
      } catch (error) {
        console.error(`Error fetching item ${object.Key}:`, error);
        // Continue processing other items
      }
    })
  );

  return allItems;
}
