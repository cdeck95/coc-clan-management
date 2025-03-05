/* eslint-disable @typescript-eslint/no-explicit-any */
import { S3Client } from "@aws-sdk/client-s3";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

// Add local storage fallback for when S3 is not available
const useLocalStorageFallback = true;

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const bucketName = process.env.AWS_S3_BUCKET || "clash-data";

// Local storage helpers (for fallback when S3 fails)
function getLocalItem(key: string): any {
  if (typeof window === "undefined") {
    return null; // Server-side rendering
  }
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

function setLocalItem(key: string, data: any): void {
  if (typeof window === "undefined") {
    return; // Server-side rendering
  }
  localStorage.setItem(key, JSON.stringify(data));
}

function removeLocalItem(key: string): void {
  if (typeof window === "undefined") {
    return; // Server-side rendering
  }
  localStorage.removeItem(key);
}

function getAllLocalItems(prefix: string): any[] {
  if (typeof window === "undefined") {
    return []; // Server-side rendering
  }

  const items: any[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const item = getLocalItem(key);
      if (item) items.push(item);
    }
  }
  return items;
}

// S3 operations with fallback
export async function getObject(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);
    const str = await response.Body?.transformToString();
    return str ? JSON.parse(str) : null;
  } catch (error) {
    console.log(
      `S3 getObject error for key ${key}, using localStorage fallback:`,
      error
    );
    if (useLocalStorageFallback) {
      return getLocalItem(key);
    }
    if ((error as any).name === "NoSuchKey") {
      return null; // Object doesn't exist yet
    }
    console.error("Error getting object from S3:", error);
    throw error;
  }
}

export async function putObject(key: string, data: any) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.log(
      `S3 putObject error for key ${key}, using localStorage fallback:`,
      error
    );
    if (useLocalStorageFallback) {
      setLocalItem(key, data);
      return true;
    }
    console.error("Error putting object in S3:", error);
    throw error;
  }
}

export async function deleteObject(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.log(
      `S3 deleteObject error for key ${key}, using localStorage fallback:`,
      error
    );
    if (useLocalStorageFallback) {
      removeLocalItem(key);
      return true;
    }
    console.error("Error deleting object from S3:", error);
    throw error;
  }
}

export async function listObjects(prefix: string) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.log(
      `S3 listObjects error for prefix ${prefix}, using localStorage fallback:`,
      error
    );
    if (useLocalStorageFallback) {
      // Return format that mimics S3 response
      const localItems = getAllLocalItems(prefix);
      return localItems.map((item) => ({ Key: prefix + item.id }));
    }
    console.error("Error listing objects in S3:", error);
    throw error;
  }
}
