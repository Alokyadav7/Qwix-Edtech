import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";
import { s3 } from "../config/aws.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

function requireBucket() {
  if (!env.aws.bucket) {
    throw new ApiError(503, "AWS_S3_BUCKET is not configured.");
  }
}

export async function uploadBuffer({ buffer, contentType, folder, filename }) {
  requireBucket();
  const key = `${folder}/${crypto.randomUUID()}-${filename.replace(/\s+/g, "-")}`;
  await s3.send(new PutObjectCommand({
    Bucket: env.aws.bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType
  }));
  return `s3://${env.aws.bucket}/${key}`;
}

export async function getSignedDownloadUrl(s3Url) {
  requireBucket();
  const key = s3Url.replace(`s3://${env.aws.bucket}/`, "");
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: env.aws.bucket, Key: key }), { expiresIn: 600 });
}

