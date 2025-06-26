import { defineConfig } from "drizzle-kit";
import * as process from "node:process";
import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

export default defineConfig({
  out: "./migrations",
  schema: "./src/backend/persistence/schemas.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
