#!/usr/bin/env bun
import { spawnSync } from "child_process";

spawnSync("bun", ["scripts/patch-opennext-otel.mjs"], { stdio: "inherit" });

const result = spawnSync("bunx", ["opennextjs-cloudflare", "build"], {
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 1);
