import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

import { env } from "@/env";
import { z } from "zod";
import { authID } from "@/backend/services/session.actions";
import { s3Client } from "@/backend/s3.client";

const bodySchema = z.object({
  keys: z.array(z.string()),
});

export const POST = async (request: Request) => {
  const userID = await authID();
  if (!userID) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
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

  for (const key of body.data.keys) {
    const command = new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    });
    await s3Client.send(command);
  }

  return NextResponse.json({
    success: true,
    message: "Files deleted successfully",
  });
};
