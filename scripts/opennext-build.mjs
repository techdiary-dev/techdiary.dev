#!/usr/bin/env bun
/**
 * OpenNext Cloudflare build wrapper.
 * Prefer the local package bin (Workers Builds caches can confuse `bunx`).
 */
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import path from "path";

spawnSync("bun", ["scripts/patch-opennext-otel.mjs"], { stdio: "inherit" });

const localBin = path.join(
  process.cwd(),
  "node_modules",
  ".bin",
  "opennextjs-cloudflare",
);
const cmd = existsSync(localBin) ? localBin : "opennextjs-cloudflare";
const result = spawnSync(cmd, ["build"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);
