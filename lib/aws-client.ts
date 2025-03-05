/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { StreamingBlobPayloadInputTypes } from "@smithy/types";

// S3 configuration
const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || "clash-data";
const region = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1";

// Create S3 client with proper credentials
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
});

// Enable debug logging for S3 operations
const DEBUG = true;

/**
 * Log debugging information if debug mode is enabled
 */
function debugLog(...args: any[]): void {
  if (DEBUG) {
    console.log("[S3]", ...args);
  }
}

/**
 * Put object into S3 bucket
 */
export async function putObject<T>(key: string, data: T): Promise<void> {
  debugLog(`Saving object to S3: ${key}`);
  debugLog("Data:", data);
  debugLog("Bucket:", bucketName);
  debugLog("Region:", region);
  debugLog("Access Key ID:", process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID);
  debugLog("Secret Access Key:", process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY);

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    });

    await s3Client.send(command);
    debugLog(`Successfully saved to S3: ${key}`);
  } catch (error) {
    console.error(`S3 putObject error for key ${key}:`, error);
    throw new Error(`Failed to save data to S3: ${error.message}`);
  }
}

/**
 * Get object from S3 bucket
 */
export async function getObject<T>(key: string): Promise<T | null> {
  debugLog(`Fetching object from S3: ${key}`);

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);
    const bodyContents = await streamToString(
      response.Body as StreamingBlobPayloadInputTypes
    );

    debugLog(`Successfully retrieved from S3: ${key}`);
    return JSON.parse(bodyContents) as T;
  } catch (error) {
    if (error.name === "NoSuchKey") {
      debugLog(`Object not found in S3: ${key}`);
      return null;
    }

    console.error(`S3 getObject error for key ${key}:`, error);
    throw new Error(`Failed to retrieve data from S3: ${error.message}`);
  }
}

/**
 * Delete object from S3 bucket
 */
export async function deleteObject(key: string): Promise<void> {
  debugLog(`Deleting object from S3: ${key}`);

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    debugLog(`Successfully deleted from S3: ${key}`);
  } catch (error) {
    console.error(`S3 deleteObject error for key ${key}:`, error);
    throw new Error(`Failed to delete data from S3: ${error.message}`);
  }
}

/**
 * List objects in S3 bucket with specific prefix
 */
export async function listObjects(prefix: string): Promise<{ Key?: string }[]> {
  debugLog(`Listing objects from S3 with prefix: ${prefix}`);

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    debugLog(
      `Found ${response.Contents?.length || 0} objects with prefix: ${prefix}`
    );
    return response.Contents || [];
  } catch (error) {
    console.error(`S3 listObjects error for prefix ${prefix}:`, error);
    throw new Error(`Failed to list objects from S3: ${error.message}`);
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
