import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
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

type tParams = Promise<{ memberId: string }>;

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
