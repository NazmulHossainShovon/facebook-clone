import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import crypto from "crypto";
import { Readable } from "stream";
import { promisify } from "util";

const randomBytes = promisify(crypto.randomBytes);

const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !bucketName || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing AWS environment variables");
}

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * Generates a unique S3 key for a file
 * @param prefix Optional prefix for the key (e.g., username)
 * @returns A unique S3 key
 */
export const generateS3Key = async (prefix?: string): Promise<string> => {
  const rawBytes = await randomBytes(16);
  const key = rawBytes.toString("hex");
  
  if (prefix) {
    return `${prefix}/${key}`;
  }
  
  return key;
};

/**
 * Uploads a stream directly to S3 using the Upload class which handles
 * stream management and multipart uploads automatically
 * @param stream The readable stream to upload
 * @param key The S3 key for the object
 * @param contentType The content type of the object
 * @returns The URL of the uploaded object
 */
export const uploadStreamToS3 = async (
  stream: Readable,
  key: string,
  contentType: string
): Promise<string> => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: stream,
    ContentType: contentType,
  };

  const upload = new Upload({
    client: s3,
    params,
  });

  await upload.done();

  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};

/**
 * Gets a presigned URL for uploading directly to S3
 * @param key The S3 key for the object
 * @param contentType The content type of the object
 * @returns The presigned URL
 */
export const getPresignedUploadUrl = async (
  key: string,
  contentType: string
): Promise<string> => {
  const params = {
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  return await getSignedUrl(s3, command, { expiresIn: 60 });
};

export default s3;