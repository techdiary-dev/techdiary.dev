import { createClient, type ClickHouseClient } from "@clickhouse/client";
import { env } from "@/env";

declare global {
  var __clickhouseClient: ClickHouseClient | undefined;
}

export function isClickHouseConfigured(): boolean {
  return Boolean(
    env.CLICKHOUSE_HOST &&
      env.CLICKHOUSE_USERNAME &&
      env.CLICKHOUSE_PASSWORD,
  );
}

function buildClickHouseUrl(): string {
  const host = env.CLICKHOUSE_HOST!;
  const port = env.CLICKHOUSE_PORT ?? "8123";
  const secure = env.CLICKHOUSE_SECURE === "true";
  return `${secure ? "https" : "http"}://${host}:${port}`;
}

/**
 * Singleton HTTP client. Returns null when ClickHouse env is not set (local dev without analytics).
 */
export function getClickHouseClient(): ClickHouseClient | null {
  if (!isClickHouseConfigured()) {
    return null;
  }

  if (!globalThis.__clickhouseClient) {
    globalThis.__clickhouseClient = createClient({
      url: buildClickHouseUrl(),
      username: env.CLICKHOUSE_USERNAME!,
      password: env.CLICKHOUSE_PASSWORD!,
      database: env.CLICKHOUSE_DATABASE ?? "default",
    });
  }

  return globalThis.__clickhouseClient;
}
