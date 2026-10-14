import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// S3 Environment Variables
const region = process.env.AWS_REGION || 'ap-south-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || '';
const customDomain = process.env.AWS_S3_CUSTOM_DOMAIN;
const endpoint = process.env.AWS_S3_ENDPOINT;
const forcePathStyle = process.env.AWS_S3_FORCE_PATH_STYLE === 'true';

// Local uploads directory for seamless offline / development fallback
const localUploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

let s3Client: S3Client | null = null;

/**
 * Returns an initialized S3Client or null if basic config is missing.
 * Supports both explicit keys and EC2 IAM instance profiles.
 */
export function getS3Client(): S3Client | null {
  if (s3Client) {
    return s3Client;
  }

  // If explicit credentials are provided:
  if (accessKeyId && secretAccessKey) {
    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      endpoint: endpoint || undefined,
      forcePathStyle
    });
    return s3Client;
  }

  // If running on EC2 with IAM role and bucket name is present:
  if (bucketName) {
    s3Client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      forcePathStyle
    });
    return s3Client;
  }

  return null;
}

/**
 * Checks whether AWS S3 has been configured.
 */
export function isS3Configured(): boolean {
  return Boolean(bucketName && (accessKeyId || process.env.AWS_PROFILE || process.env.NODE_ENV === 'production'));
}

/**
 * Returns public S3 status information (safe for client inspection).
 */
export function getS3Info() {
  const configured = isS3Configured();
  return {
    configured,
    storageMode: configured ? 'AWS_S3' : 'LOCAL_FALLBACK',
    bucket: bucketName || 'Not configured',
    region,
    customDomain: customDomain || null,
    hasCredentials: Boolean(accessKeyId && secretAccessKey)
  };
}

/**
 * Verifies S3 connection and bucket access.
 */
export async function testS3Connection(): Promise<{
  connected: boolean;
  message: string;
  bucket?: string;
  region?: string;
  error?: string;
}> {
  const client = getS3Client();
  if (!client || !bucketName) {
    return {
      connected: false,
      message: 'AWS S3 is not configured in backend/.env. Running with local storage fallback.',
      bucket: bucketName || undefined,
      region
    };
  }

  try {
    const command = new HeadBucketCommand({ Bucket: bucketName });
    await client.send(command);

    return {
      connected: true,
      message: `Successfully connected to S3 bucket '${bucketName}' in region '${region}'!`,
      bucket: bucketName,
      region
    };
  } catch (err: any) {
    // If HeadBucket gives 403 or 404, capture message
    const errorMsg = err?.message || String(err);
    return {
      connected: false,
      message: `Failed to connect to S3 bucket '${bucketName}': ${errorMsg}`,
      bucket: bucketName,
      region,
      error: errorMsg
    };
  }
}

/**
 * Generates an accessible URL for a given S3 key.
 */
export function getS3PublicUrl(key: string): string {
  if (customDomain) {
    const domain = customDomain.replace(/\/+$/, '');
    return `${domain}/${key}`;
  }
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Cleans a file name for safe S3 keys.
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-');
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
  mimeType: string;
  isS3: boolean;
  isLocalFallback?: boolean;
}

/**
 * Uploads a file buffer directly to AWS S3 (or local fallback if unconfigured).
 */
export async function uploadToS3(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  folder?: string;
}): Promise<UploadResult> {
  const { buffer, fileName, mimeType, folder = 'general' } = params;
  const cleanName = sanitizeFileName(fileName);
  const key = `${folder}/${Date.now()}-${cleanName}`;
  const client = getS3Client();

  if (client && bucketName) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType
      });

      await client.send(command);
      const url = getS3PublicUrl(key);

      return {
        url,
        key,
        bucket: bucketName,
        size: buffer.length,
        mimeType,
        isS3: true
      };
    } catch (err) {
      console.warn(`⚠️ [S3 Upload Error] Failed uploading to S3, falling back to local:`, (err as Error).message);
      // Fall through to local fallback
    }
  }

  // Local fallback storage
  const targetFolder = path.join(localUploadsDir, folder);
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  const localFilePath = path.join(localUploadsDir, key);
  fs.writeFileSync(localFilePath, buffer);

  const port = process.env.PORT || 5000;
  const localUrl = `http://localhost:${port}/uploads/${key}`;

  return {
    url: localUrl,
    key,
    bucket: 'local-fallback',
    size: buffer.length,
    mimeType,
    isS3: false,
    isLocalFallback: true
  };
}

/**
 * Generates a presigned URL for direct browser uploads to S3.
 */
export async function generatePresignedUploadUrl(params: {
  fileName: string;
  mimeType: string;
  folder?: string;
  expiresIn?: number;
}): Promise<{
  uploadUrl: string;
  fileUrl: string;
  key: string;
  bucket: string;
}> {
  const { fileName, mimeType, folder = 'general', expiresIn = 3600 } = params;
  const client = getS3Client();

  if (!client || !bucketName) {
    throw new Error('AWS S3 is not configured. Cannot generate presigned upload URL.');
  }

  const cleanName = sanitizeFileName(fileName);
  const key = `${folder}/${Date.now()}-${cleanName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: mimeType
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  const fileUrl = getS3PublicUrl(key);

  return {
    uploadUrl,
    fileUrl,
    key,
    bucket: bucketName
  };
}

/**
 * Deletes an object from S3 or local storage.
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  const client = getS3Client();

  if (client && bucketName) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      await client.send(command);
      return true;
    } catch (err) {
      console.error(`Failed to delete S3 object '${key}':`, err);
    }
  }

  // Check local fallback
  const localFilePath = path.join(localUploadsDir, key);
  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
    return true;
  }

  return false;
}

/**
 * Lists objects with a given prefix.
 */
export async function listS3Objects(prefix: string = '', maxKeys: number = 50) {
  const client = getS3Client();
  if (!client || !bucketName) {
    return [];
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys
    });
    const response = await client.send(command);
    return (response.Contents || []).map(item => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      url: item.Key ? getS3PublicUrl(item.Key) : ''
    }));
  } catch (err) {
    console.error('Failed to list S3 objects:', err);
    return [];
  }
}
