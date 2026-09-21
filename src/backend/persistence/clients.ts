import "dotenv/config";
import { PostgresAdapter } from "sqlkit";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schemas";
import { Pool } from "pg";
import { env } from "@/env";
import { getCloudflareContext } from "@opennextjs/cloudflare";

declare global {
  var pgClient: PostgresAdapter | undefined;
  var __techdiaryPool: Pool | undefined;
  var __techdiaryDbUrl: string | undefined;
  var __techdiaryDrizzle: ReturnType<typeof drizzle> | undefined;
}

function resolveDatabaseUrl(): string {
  if (globalThis.__techdiaryDbUrl) return globalThis.__techdiaryDbUrl;

  // During `next build` prerender, stay on DATABASE_URL.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    globalThis.__techdiaryDbUrl = env.DATABASE_URL;
    return globalThis.__techdiaryDbUrl;
  }

  try {
    const { env: cfEnv } = getCloudflareContext();
    const hd = (
      cfEnv as { HYPERDRIVE?: { connectionString?: string } }
    ).HYPERDRIVE;
    if (hd?.connectionString) {
      globalThis.__techdiaryDbUrl = hd.connectionString;
      return globalThis.__techdiaryDbUrl;
    }
  } catch {
    // next dev / no request context yet
  }

  globalThis.__techdiaryDbUrl = env.DATABASE_URL;
  return globalThis.__techdiaryDbUrl;
}

function getPool(): Pool {
  if (!globalThis.__techdiaryPool) {
    globalThis.__techdiaryPool = new Pool({
      connectionString: resolveDatabaseUrl(),
      max: 1,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 10_000,
    });
  }
  return globalThis.__techdiaryPool;
}

function getAdapter(): PostgresAdapter {
  if (!globalThis.pgClient) {
    globalThis.pgClient = new PostgresAdapter(getPool());
  }
  return globalThis.pgClient;
}

export const drizzleClient = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    if (!globalThis.__techdiaryDrizzle) {
      globalThis.__techdiaryDrizzle = drizzle(getPool(), { schema });
    }
    return Reflect.get(globalThis.__techdiaryDrizzle as object, prop, receiver);
  },
});

export const pgClient = new Proxy({} as PostgresAdapter, {
  get(_target, prop, receiver) {
    return Reflect.get(getAdapter() as object, prop, receiver);
  },
});
