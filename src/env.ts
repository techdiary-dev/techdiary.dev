import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    // UNSPLASH_CLIENT_ID: z.string(),
    CLOUDINARY_URL: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    GITHUB_CALLBACK_URL: z.string(),
    DATABASE_URL: z.string(),
    MEILISEARCH_ADMIN_API_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_MEILISEARCH_API_HOST: z.string().url(),
    NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY: z.string(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    // UNSPLASH_CLIENT_ID: process.env.UNSPLASH_CLIENT_ID,
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
    CRON_SECRET: process.env.CRON_SECRET,
  },
});
