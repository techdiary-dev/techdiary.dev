import { readFileSync, writeFileSync, existsSync } from "fs";

const target =
  "node_modules/@opennextjs/cloudflare/dist/cli/build/open-next/bundle-node-middleware.js";

if (!existsSync(target)) process.exit(0);

const text = readFileSync(target, "utf8");
const needle =
  'const hasOpentelemetry = existsSync(path.join(options.appBuildOutputPath, "node_modules", "@opentelemetry", "api"));';
const replacement =
  "const hasOpentelemetry = false; // techdiary: force Next compiled otel alias";

if (text.includes(needle)) {
  writeFileSync(target, text.replace(needle, replacement));
  console.log("Patched OpenNext otel alias");
}
