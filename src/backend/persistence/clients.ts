import "dotenv/config";
import { PostgresAdapter } from "sqlkit";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schemas";
import { Client, Pool } from "pg";
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
 * bypass Hyperdrive.
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
    // next dev / no request context yet
  }

  return env.DATABASE_URL;
}

function inCloudflareWorker(): boolean {
  try {
    getCloudflareContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Hyperdrive docs: create a new client per request — Hyperdrive pools at the
 * edge. A reused `pg.Pool` across Worker invocations leaves dead sockets that
 * hang on `connect()` → "timeout exceeded when trying to connect".
 *
 * sqlkit's PostgresAdapter only needs `.query(sql, values, cb)`.
 */
function createWorkerQueryPool(connectionString: string): Pool {
  const query = (
    text: string,
    values: unknown[],
    cb: (err: Error | undefined, result?: unknown) => void,
  ) => {
    const client = new Client({
      connectionString,
      connectionTimeoutMillis: 10_000,
    });

    void (async () => {
      try {
        await client.connect();
        const result = await client.query(text, values as unknown[]);
        cb(undefined, result);
      } catch (err) {
        cb(err instanceof Error ? err : new Error(String(err)));
      } finally {
        try {
          const { ctx } = getCloudflareContext();
          ctx.waitUntil(client.end().catch(() => undefined));
        } catch {
          await client.end().catch(() => undefined);
        }
      }
    })();
  };

  // PostgresAdapter only calls `.query` — cast the minimal shim to Pool.
  return { query } as unknown as Pool;
}

function resetLocalPool() {
  const old = globalThis.__techdiaryPool;
  globalThis.__techdiaryPool = undefined;
  globalThis.__techdiaryPoolUrl = undefined;
  globalThis.pgClient = undefined;
  globalThis.__techdiaryDrizzle = undefined;
  void old?.end().catch(() => {});
}

function getPool(): Pool {
  const url = resolveDatabaseUrl();

  if (inCloudflareWorker()) {
    return createWorkerQueryPool(url);
  }

  if (!globalThis.__techdiaryPool || globalThis.__techdiaryPoolUrl !== url) {
    if (globalThis.__techdiaryPool) resetLocalPool();
    globalThis.__techdiaryPoolUrl = url;
    globalThis.__techdiaryPool = new Pool({
      connectionString: url,
      max: 10,
      connectionTimeoutMillis: 15_000,
      idleTimeoutMillis: 10_000,
    });
  }
  return globalThis.__techdiaryPool;
}

function getAdapter(): PostgresAdapter {
  if (inCloudflareWorker()) {
    // New adapter wrapping a per-call client factory (no shared sockets).
    return new PostgresAdapter(getPool());
  }

  const pool = getPool();
  if (!globalThis.pgClient) {
    globalThis.pgClient = new PostgresAdapter(pool);
  }
  return globalThis.pgClient;
}

export const drizzleClient = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    if (inCloudflareWorker()) {
      // Short-lived pool; Hyperdrive holds the real origin connections.
      const pool = new Pool({
        connectionString: resolveDatabaseUrl(),
        max: 1,
        connectionTimeoutMillis: 10_000,
        allowExitOnIdle: true,
        idleTimeoutMillis: 1_000,
        maxUses: 1,
      });
      const d = drizzle(pool, { schema });
      return Reflect.get(d as object, prop, receiver);
    }

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
