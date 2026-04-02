import { StandardSchemaV1 } from "@t3-oss/env-core";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    UNSPLASH_API_KEY: z.string(),
    CLOUDINARY_URL: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    GITHUB_CALLBACK_URL: z.string(),
    DATABASE_URL: z.string(),
    MEILISEARCH_ADMIN_API_KEY: z.string(),

    // S3
    S3_ENDPOINT: z.string().min(1),
    S3_REGION: z.string().min(1),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_ACCESS_SECRET: z.string().min(1),
    S3_BUCKET: z.string().min(1),

    // Inngest
    INNGEST_EVENT_KEY: z.string().optional(),
    INNGEST_SIGNING_KEY: z.string().optional(),

    // Pusher / Soketi (server-side)
    PUSHER_APP_ID: z.string().optional(),
    PUSHER_APP_KEY: z.string().optional(),
    PUSHER_APP_SECRET: z.string().optional(),
    PUSHER_HOST: z.string().optional(),
    PUSHER_PORT: z.string().optional(),
    PUSHER_USE_TLS: z.string().optional(),
    PUSHER_CLUSTER: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_MEILISEARCH_API_HOST: z.url(),
    NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY: z.string(),

    // Pusher / Soketi (client-side)
    NEXT_PUBLIC_PUSHER_APP_KEY: z.string().optional(),
    NEXT_PUBLIC_PUSHER_HOST: z.string().optional(),
    NEXT_PUBLIC_PUSHER_PORT: z.string().optional(),
    NEXT_PUBLIC_PUSHER_FORCE_TLS: z.string().optional(),
    NEXT_PUBLIC_PUSHER_CLUSTER: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_MEILISEARCH_API_HOST:
      process.env.NEXT_PUBLIC_MEILISEARCH_API_HOST,
    MEILISEARCH_ADMIN_API_KEY: process.env.MEILISEARCH_ADMIN_API_KEY,
    NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY:
      process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY,
    UNSPLASH_API_KEY: process.env.UNSPLASH_API_KEY,

    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_REGION: process.env.S3_REGION,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_ACCESS_SECRET: process.env.S3_ACCESS_SECRET,
    S3_BUCKET: process.env.S3_BUCKET,

    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,

    PUSHER_APP_ID: process.env.PUSHER_APP_ID,
    PUSHER_APP_KEY: process.env.PUSHER_APP_KEY,
    PUSHER_APP_SECRET: process.env.PUSHER_APP_SECRET,
    PUSHER_HOST: process.env.PUSHER_HOST,
    PUSHER_PORT: process.env.PUSHER_PORT,
    PUSHER_USE_TLS: process.env.PUSHER_USE_TLS,
    PUSHER_CLUSTER: process.env.PUSHER_CLUSTER,

    NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
    NEXT_PUBLIC_PUSHER_HOST: process.env.NEXT_PUBLIC_PUSHER_HOST,
    NEXT_PUBLIC_PUSHER_PORT: process.env.NEXT_PUBLIC_PUSHER_PORT,
    NEXT_PUBLIC_PUSHER_FORCE_TLS: process.env.NEXT_PUBLIC_PUSHER_FORCE_TLS,
    NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  },
  onValidationError(issues: readonly StandardSchemaV1.Issue[]) {
    console.error("❌ Invalid environment variables:", issues);
    throw new Error("Invalid environment variables", {
      cause: JSON.stringify(issues),
    });
  },
});
