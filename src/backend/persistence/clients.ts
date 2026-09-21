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
  var __techdiaryPoolUrl: string | undefined;
  var __techdiaryDrizzle: ReturnType<typeof drizzle> | undefined;
}

type HyperdriveBinding = { connectionString?: string };

/**
 * Prefer Hyperdrive on Workers. Never permanently cache the DATABASE_URL
 * fallback — an early resolve without CF context used to stick forever and
 * bypass Hyperdrive (connection timeouts → React #441 in RSC).
 */
function resolveDatabaseUrl(): string {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return env.DATABASE_URL;
  }

  try {
    const { env: cfEnv } = getCloudflareContext();
    const hd = (cfEnv as { HYPERDRIVE?: HyperdriveBinding }).HYPERDRIVE;
    if (hd?.connectionString) {
      return hd.connectionString;
    }
  } catch {
    // next dev / no request context yet — fall through
  }

  return env.DATABASE_URL;
}

function resetPool() {
  const old = globalThis.__techdiaryPool;
  globalThis.__techdiaryPool = undefined;
  globalThis.__techdiaryPoolUrl = undefined;
  globalThis.pgClient = undefined;
  globalThis.__techdiaryDrizzle = undefined;
  void old?.end().catch(() => {});
}

function getPool(): Pool {
  const url = resolveDatabaseUrl();
  if (!globalThis.__techdiaryPool || globalThis.__techdiaryPoolUrl !== url) {
    if (globalThis.__techdiaryPool) resetPool();
    globalThis.__techdiaryPoolUrl = url;
    globalThis.__techdiaryPool = new Pool({
      connectionString: url,
      max: 1,
      // Hyperdrive origin connect timeout is 15s; match that.
      connectionTimeoutMillis: 15_000,
      idleTimeoutMillis: 5_000,
      allowExitOnIdle: true,
    });
  }
  return globalThis.__techdiaryPool;
}

function getAdapter(): PostgresAdapter {
  const pool = getPool();
  if (!globalThis.pgClient) {
    globalThis.pgClient = new PostgresAdapter(pool);
  }
  return globalThis.pgClient;
}

export const drizzleClient = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    if (
      !globalThis.__techdiaryDrizzle ||
      globalThis.__techdiaryPoolUrl !== resolveDatabaseUrl()
    ) {
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
