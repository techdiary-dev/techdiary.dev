import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/env";

export const s3Client = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_ACCESS_SECRET,
  },
});
