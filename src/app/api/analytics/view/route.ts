import { getClickHouseClient, isClickHouseConfigured } from "@/backend/persistence/clickhouse.client";
import { AnalyticsInput } from "@/backend/services/inputs/analytics.input";
import { authID } from "@/backend/services/session.actions";
import { NextResponse } from "next/server";

/**
 * Records one resource view event (append-only). No-ops with 204 when ClickHouse is not configured.
 */
export async function POST(req: Request) {
  if (!isClickHouseConfigured()) {
    return new NextResponse(null, { status: 204 });
  }

  const client = getClickHouseClient();
  if (!client) {
    return new NextResponse(null, { status: 204 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = await AnalyticsInput.recordViewBody.safeParseAsync(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  const userId = await authID();
  const referrer = req.headers.get("referer");

  const session =
    userId != null
      ? { session_type: "AUTHENTICATED" as const, session_id: userId }
      : { session_type: "ANON" as const, session_id: parsed.data.session_id };

  try {
    await client.insert({
      table: "resource_views",
      values: [
        {
          resource_type: parsed.data.resource_type,
          resource_id: parsed.data.resource_id,
          session_type: session.session_type,
          session_id: session.session_id,
          referrer: referrer ? referrer.slice(0, 2048) : null,
          country_code: null,
        },
      ],
      format: "JSONEachRow",
    });
  } catch (e) {
    console.error("[analytics/view] ClickHouse insert failed:", e);
    return new NextResponse(null, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
