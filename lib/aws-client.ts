/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { StreamingBlobPayloadInputTypes } from "@smithy/types";

const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || "clash-data";
const region = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1";

// Create S3 client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
});

// LocalStorage key prefix
const LS_PREFIX = "coc_clan_";

/**
 * Put object into S3 bucket or localStorage fallback
 */
export async function putObject<T>(key: string, data: T): Promise<void> {
  // Always save to localStorage as a backup/fallback
  try {
    localStorage.setItem(`${LS_PREFIX}${key}`, JSON.stringify(data));
  } catch (error) {
    console.error("LocalStorage save error:", error);
  }

  // If we're in development or missing AWS credentials, don't try S3
  if (isUsingLocalStorageFallback()) {
    return; // Use only localStorage in development
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    });

    await s3Client.send(command);
    console.log(`Successfully saved to S3: ${key}`);
  } catch (error) {
    console.error(
      `S3 putObject error for key ${key}, using localStorage fallback:`,
      error
    );
    // We've already saved to localStorage, so we can just return
  }
}

/**
 * Get object from S3 bucket or localStorage fallback
 */
export async function getObject<T>(key: string): Promise<T | null> {
  // Try localStorage first for faster access
  try {
    const localData = localStorage.getItem(`${LS_PREFIX}${key}`);
    if (localData) {
      return JSON.parse(localData) as T;
    }
  } catch (error) {
    console.error(`LocalStorage read error for ${key}:`, error);
  }

  // If we're in development or missing AWS credentials, don't try S3
  if (isUsingLocalStorageFallback()) {
    return null; // If not in localStorage and in development, return null
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);
    const bodyContents = await streamToString(
      response.Body as StreamingBlobPayloadInputTypes
    );

    // Save to localStorage for future quick access
    try {
      localStorage.setItem(`${LS_PREFIX}${key}`, bodyContents);
    } catch (localError) {
      console.warn("Failed to cache S3 data in localStorage:", localError);
    }

    return JSON.parse(bodyContents) as T;
  } catch (error) {
    console.error(
      `S3 getObject error for key ${key}, using localStorage fallback:`,
      error
    );
    return null;
  }
}

/**
 * Delete object from S3 bucket and localStorage
 */
export async function deleteObject(key: string): Promise<void> {
  // Always delete from localStorage
  try {
    localStorage.removeItem(`${LS_PREFIX}${key}`);
  } catch (error) {
    console.error("LocalStorage delete error:", error);
  }

  // If we're in development or missing AWS credentials, don't try S3
  if (isUsingLocalStorageFallback()) {
    return; // Only delete from localStorage in development
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`Successfully deleted from S3: ${key}`);
  } catch (error) {
    console.error(`S3 deleteObject error for key ${key}:`, error);
    // We've already deleted from localStorage, so no further action needed
  }
}

/**
 * List objects in S3 bucket with specific prefix
 * or fallback to listing localStorage keys
 */
export async function listObjects(prefix: string): Promise<{ Key?: string }[]> {
  // If we're in development or missing AWS credentials, use localStorage
  if (isUsingLocalStorageFallback()) {
    return listLocalStorageObjects(prefix);
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error(
      `S3 listObjects error for prefix ${prefix}, using localStorage fallback:`,
      error
    );
    return listLocalStorageObjects(prefix);
  }
}

/**
 * Helper function to convert stream to string
 */
async function streamToString(
  stream: StreamingBlobPayloadInputTypes
): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  return buffer.toString("utf-8");
}

/**
 * List objects from localStorage that match a given prefix
 */
function listLocalStorageObjects(prefix: string): { Key?: string }[] {
  try {
    const result: { Key?: string }[] = [];
    const fullPrefix = `${LS_PREFIX}${prefix}`;

    // Loop through localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(fullPrefix)) {
        // Remove the LS_PREFIX to match S3 key format
        const s3Key = key.substring(LS_PREFIX.length);
        result.push({ Key: s3Key });
      }
    }

    return result;
  } catch (error) {
    console.error("Error listing localStorage objects:", error);
    return [];
  }
}

/**
 * Check if we should use localStorage fallback
 */
function isUsingLocalStorageFallback(): boolean {
  const isDevelopment = process.env.NODE_ENV === "development";
  const missingCredentials =
    !process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID ||
    !process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;

  // If in development or missing credentials, use localStorage
  return isDevelopment || missingCredentials;
}
