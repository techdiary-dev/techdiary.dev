import { z } from "zod/v4";
import { handleActionException } from "./RepositoryException";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env";
import { s3Client } from "../s3.client";

const schema = z.object({
  url: z.url(),
  key: z.string(),
});

export const uploadByUrl = async (_input: z.infer<typeof schema>) => {
  try {
    const input = await schema.parseAsync(_input);
    const api = await fetch(input.url);
    const body = await api.bytes();
    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: input.key,
      ContentType: "image/jpeg",
      Body: body,
    });
    await s3Client.send(command);
    return {
      success: true as const,
      data: {
        key: input.key,
        provider: "r2",
      },
    };
  } catch (error) {
    return handleActionException(error);
  }
};
