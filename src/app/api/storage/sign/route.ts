import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

import { z } from "zod";
import { env } from "@/env";
import { authID } from "@/backend/services/session.actions";
import { s3Client } from "@/backend/s3.client";

const bodySchema = z.object({
  keys: z.array(z.string()),
});

export const POST = async (request: Request) => {
  const sessionId = await authID();
  if (!sessionId) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await bodySchema.safeParseAsync(await request.json());

  if (!body.success) {
    return new Response(JSON.stringify(body.error), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const keys = body.data.keys.map((key) => {
    return {
      Key: key,
      ContentType: "image/png",
    };
  });

  const urls = await Promise.all(
    keys.map(async (key) => {
      const command = new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key.Key,
        ContentType: key.ContentType,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 60 * 60 * 24 * 7,
      });

      return signedUrl;
    })
  );

  return NextResponse.json({
    success: true,
    data: { signedUrls: urls },
  });
};
