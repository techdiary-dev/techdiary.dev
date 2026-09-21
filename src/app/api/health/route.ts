import { NextResponse } from "next/server";
import { connection } from "next/server";

export async function GET() {
  await connection();
  const out: Record<string, unknown> = { ok: false };
  try {
    const { env } = await import("@/env");
    out.envOk = true;
    out.hasDb = Boolean(env.DATABASE_URL);
    out.hasAlgolia = Boolean(env.ALGOLIA_APP_ID);
    out.hasPusher = Boolean(env.PUSHER_APP_ID);

    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env: cfEnv } = getCloudflareContext();
    const hd = (cfEnv as { HYPERDRIVE?: { connectionString?: string } })
      .HYPERDRIVE;
    out.hasHyperdrive = Boolean(hd?.connectionString);
    if (hd?.connectionString) {
      try {
        const u = new URL(hd.connectionString);
        out.hyperdriveHost = u.hostname;
        out.hyperdrivePort = u.port || "5432";
      } catch {
        out.hyperdriveHost = "unparsed";
      }
    }

    const started = Date.now();
    const { pgClient } = await import(
      "@/backend/persistence/clients"
    );
    const rows = await pgClient.executeSQL(
      "select count(*)::int as n from users",
      [],
    );
    out.queryMs = Date.now() - started;
    out.users = rows.rows?.[0] ?? rows;
    out.ok = true;
    return NextResponse.json(out);
  } catch (e) {
    out.error = e instanceof Error ? e.message : String(e);
    out.stack =
      e instanceof Error ? e.stack?.split("\n").slice(0, 12) : undefined;
    return NextResponse.json(out, { status: 500 });
  }
}
