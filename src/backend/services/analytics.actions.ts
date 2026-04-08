"use server";

import { z } from "zod/v4";
import { and, eq, isNotNull } from "sqlkit";
import {
  getClickHouseClient,
  isClickHouseConfigured,
} from "../persistence/clickhouse.client";
import { persistenceRepository } from "../persistence/persistence-repositories";
import { pgClient } from "../persistence/clients";
import { ActionException, handleActionException } from "./RepositoryException";
import { authID } from "./session.actions";
import {
  AnalyticsInput,
  type TrackedResourceType,
} from "./inputs/analytics.input";
import type { ActionResponse } from "../models/action-contracts";

const sql = String.raw;

export type ResourceAnalyticsDayRow = {
  date: string;
  impressions: number;
  unique_viewers: number;
};

export type ResourceAnalyticsData = {
  series: ResourceAnalyticsDayRow[];
  totals: {
    impressions: number;
    unique_viewers: number;
  };
  reactions: number;
  bookmarks: number;
  clickhouseConfigured: boolean;
};

export type DashboardAnalyticsOverviewData = ResourceAnalyticsData & {
  publishedArticleCount: number;
  publicGistCount: number;
};

const MAX_TRACKED_ARTICLES = 5000;
const MAX_TRACKED_GISTS = 200;
const MAX_CUSTOM_RANGE_MS = 366 * 86400000;

type ClickHouseTimeFilter =
  | { kind: "preset"; days: number }
  | {
      kind: "custom";
      range_start: string;
      range_end_exclusive: string;
    };

function resolveClickHouseTimeFilter(payload: {
  range_days?: number;
  start_date?: string;
  end_date?: string;
}): ClickHouseTimeFilter {
  if (payload.start_date && payload.end_date) {
    const start = new Date(`${payload.start_date}T00:00:00.000Z`);
    const endInclusive = new Date(`${payload.end_date}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(endInclusive.getTime())) {
      throw new ActionException("Invalid date range");
    }
    const endExclusive = new Date(endInclusive);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
    const span = endExclusive.getTime() - start.getTime();
    if (span <= 0) {
      throw new ActionException("Invalid date range");
    }
    if (span > MAX_CUSTOM_RANGE_MS) {
      throw new ActionException("Custom range cannot exceed 366 days");
    }
    const fmt = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");
    return {
      kind: "custom",
      range_start: fmt(start),
      range_end_exclusive: fmt(endExclusive),
    };
  }
  const days = payload.range_days ?? 30;
  return { kind: "preset", days };
}

function clickHouseTimePredicate(filter: ClickHouseTimeFilter): string {
  return filter.kind === "preset"
    ? "viewed_at >= now() - INTERVAL {days:UInt32} DAY"
    : "viewed_at >= parseDateTimeBestEffort({range_start:String}) AND viewed_at < parseDateTimeBestEffort({range_end_exclusive:String})";
}

function clickHouseTimeParams(
  filter: ClickHouseTimeFilter,
): Record<string, string | number> {
  if (filter.kind === "preset") {
    return { days: filter.days };
  }
  return {
    range_start: filter.range_start,
    range_end_exclusive: filter.range_end_exclusive,
  };
}

function buildClickHouseResourceFilter(
  articleIds: string[],
  gistIds: string[],
) {
  const parts: string[] = [];
  const extra: Record<string, string[]> = {};
  if (articleIds.length > 0) {
    parts.push(
      `(resource_type = 'ARTICLE' AND resource_id IN {article_ids:Array(UUID)})`,
    );
    extra.article_ids = articleIds;
  }
  if (gistIds.length > 0) {
    parts.push(
      `(resource_type = 'GIST' AND resource_id IN {gist_ids:Array(UUID)})`,
    );
    extra.gist_ids = gistIds;
  }
  return { parts, extra };
}

async function assertResourceAnalyticsAccess(
  userId: string,
  resourceType: TrackedResourceType,
  resourceId: string,
) {
  if (resourceType === "ARTICLE") {
    const [row] = await persistenceRepository.article.find({
      limit: 1,
      columns: ["id"],
      where: and(eq("id", resourceId), eq("author_id", userId)),
    });
    if (!row) {
      throw new ActionException("Forbidden");
    }
    return;
  }

  if (resourceType === "GIST") {
    const [row] = await persistenceRepository.gist.find({
      limit: 1,
      columns: ["id"],
      where: and(eq("id", resourceId), eq("owner_id", userId)),
    });
    if (!row) {
      throw new ActionException("Forbidden");
    }
  }
}

async function countReactionsRaw(resourceId: string, resourceType: string) {
  const q = sql`
    SELECT COUNT(*)::int AS c FROM reactions
    WHERE resource_id = $1 AND resource_type = $2
  `;
  const res = await pgClient.executeSQL(q, [resourceId, resourceType]);
  const row = res?.rows?.[0] as { c?: number } | undefined;
  return Number(row?.c ?? 0);
}

async function countBookmarksRaw(resourceId: string, resourceType: string) {
  const q = sql`
    SELECT COUNT(*)::int AS c FROM bookmarks
    WHERE resource_id = $1 AND resource_type = $2
  `;
  const res = await pgClient.executeSQL(q, [resourceId, resourceType]);
  const row = res?.rows?.[0] as { c?: number } | undefined;
  return Number(row?.c ?? 0);
}

export async function getResourceAnalytics(
  input: z.infer<typeof AnalyticsInput.getResourceAnalyticsInput>,
): Promise<ActionResponse<ResourceAnalyticsData>> {
  try {
    const payload =
      await AnalyticsInput.getResourceAnalyticsInput.parseAsync(input);
    const userId = await authID();
    if (!userId) {
      throw new ActionException("Unauthorized");
    }

    await assertResourceAnalyticsAccess(
      userId,
      payload.resource_type,
      payload.resource_id,
    );

    const [reactions, bookmarks] = await Promise.all([
      countReactionsRaw(payload.resource_id, payload.resource_type),
      payload.resource_type === "GIST"
        ? Promise.resolve(0)
        : countBookmarksRaw(payload.resource_id, payload.resource_type),
    ]);

    const chConfigured = isClickHouseConfigured();
    const client = getClickHouseClient();

    if (!chConfigured || !client) {
      return {
        success: true,
        data: {
          series: [],
          totals: { impressions: 0, unique_viewers: 0 },
          reactions,
          bookmarks,
          clickhouseConfigured: false,
        },
      };
    }

    const timeFilter = resolveClickHouseTimeFilter(payload);
    const timePred = clickHouseTimePredicate(timeFilter);
    const params = {
      type: payload.resource_type,
      id: payload.resource_id,
      ...clickHouseTimeParams(timeFilter),
    };

    const [seriesResult, totalsResult] = await Promise.all([
      client.query({
        query: `
          SELECT
            toDate(viewed_at) AS date,
            toUInt64(count()) AS impressions,
            toUInt64(uniq(session_id)) AS unique_viewers
          FROM resource_views
          WHERE resource_type = {type:String}
            AND resource_id = {id:UUID}
            AND (${timePred})
          GROUP BY date
          ORDER BY date
        `,
        query_params: params,
        format: "JSONEachRow",
      }),
      client.query({
        query: `
          SELECT
            toUInt64(count()) AS impressions,
            toUInt64(uniq(session_id)) AS unique_viewers
          FROM resource_views
          WHERE resource_type = {type:String}
            AND resource_id = {id:UUID}
            AND (${timePred})
        `,
        query_params: params,
        format: "JSONEachRow",
      }),
    ]);

    const seriesRows = (await seriesResult.json()) as Array<{
      date: string;
      impressions: string | number;
      unique_viewers: string | number;
    }>;

    const totalsRows = (await totalsResult.json()) as Array<{
      impressions: string | number;
      unique_viewers: string | number;
    }>;

    const totalsRow = totalsRows[0];

    return {
      success: true,
      data: {
        series: seriesRows.map((r) => ({
          date: String(r.date),
          impressions: Number(r.impressions),
          unique_viewers: Number(r.unique_viewers),
        })),
        totals: {
          impressions: Number(totalsRow?.impressions ?? 0),
          unique_viewers: Number(totalsRow?.unique_viewers ?? 0),
        },
        reactions,
        bookmarks,
        clickhouseConfigured: true,
      },
    };
  } catch (error) {
    return handleActionException(error);
  }
}

async function countReactionsForResources(
  articleIds: string[],
  gistIds: string[],
) {
  const q = sql`
    SELECT COUNT(*)::int AS c FROM reactions
    WHERE
      (resource_type = 'ARTICLE' AND resource_id = ANY($1::uuid[]))
      OR (resource_type = 'GIST' AND resource_id = ANY($2::uuid[]))
  `;
  const res = await pgClient.executeSQL(q, [articleIds, gistIds]);
  const row = res?.rows?.[0] as { c?: number } | undefined;
  return Number(row?.c ?? 0);
}

async function countBookmarksForArticles(articleIds: string[]) {
  const q = sql`
    SELECT COUNT(*)::int AS c FROM bookmarks
    WHERE resource_type = 'ARTICLE' AND resource_id = ANY($1::uuid[])
  `;
  const res = await pgClient.executeSQL(q, [articleIds]);
  const row = res?.rows?.[0] as { c?: number } | undefined;
  return Number(row?.c ?? 0);
}

/**
 * Aggregated view analytics across the current user's published articles and public gists.
 */
export async function getDashboardAnalyticsOverview(
  input: z.infer<typeof AnalyticsInput.getDashboardAnalyticsOverviewInput>,
): Promise<ActionResponse<DashboardAnalyticsOverviewData>> {
  try {
    const payload =
      await AnalyticsInput.getDashboardAnalyticsOverviewInput.parseAsync(input);
    const userId = await authID();
    if (!userId) {
      throw new ActionException("Unauthorized");
    }

    const [articleRows, gistRows] = await Promise.all([
      persistenceRepository.article.find({
        where: and(eq("author_id", userId), isNotNull("published_at")),
        columns: ["id"],
        limit: MAX_TRACKED_ARTICLES,
      }),
      persistenceRepository.gist.find({
        where: and(eq("owner_id", userId), eq("is_public", true)),
        columns: ["id"],
        limit: MAX_TRACKED_GISTS,
      }),
    ]);

    const articleIds = articleRows.map((a) => a.id);
    const gistIds = gistRows.map((g) => g.id);

    const [reactions, bookmarks] = await Promise.all([
      countReactionsForResources(articleIds, gistIds),
      countBookmarksForArticles(articleIds),
    ]);

    const chConfigured = isClickHouseConfigured();
    const client = getClickHouseClient();
    const { parts, extra } = buildClickHouseResourceFilter(articleIds, gistIds);

    if (!chConfigured || !client) {
      return {
        success: true,
        data: {
          series: [],
          totals: { impressions: 0, unique_viewers: 0 },
          reactions,
          bookmarks,
          clickhouseConfigured: false,
          publishedArticleCount: articleIds.length,
          publicGistCount: gistIds.length,
        },
      };
    }

    if (parts.length === 0) {
      return {
        success: true,
        data: {
          series: [],
          totals: { impressions: 0, unique_viewers: 0 },
          reactions,
          bookmarks,
          clickhouseConfigured: true,
          publishedArticleCount: articleIds.length,
          publicGistCount: gistIds.length,
        },
      };
    }

    const resourceWhere = parts.join(" OR ");
    const timeFilter = resolveClickHouseTimeFilter(payload);
    const timePred = clickHouseTimePredicate(timeFilter);
    const baseParams = {
      ...extra,
      ...clickHouseTimeParams(timeFilter),
    };

    const [seriesResult, totalsResult] = await Promise.all([
      client.query({
        query: `
          SELECT
            toDate(viewed_at) AS date,
            toUInt64(count()) AS impressions,
            toUInt64(uniq(session_id)) AS unique_viewers
          FROM resource_views
          WHERE (${timePred})
            AND (${resourceWhere})
          GROUP BY date
          ORDER BY date
        `,
        query_params: baseParams,
        format: "JSONEachRow",
      }),
      client.query({
        query: `
          SELECT
            toUInt64(count()) AS impressions,
            toUInt64(uniq(session_id)) AS unique_viewers
          FROM resource_views
          WHERE (${timePred})
            AND (${resourceWhere})
        `,
        query_params: baseParams,
        format: "JSONEachRow",
      }),
    ]);

    const seriesRows = (await seriesResult.json()) as Array<{
      date: string;
      impressions: string | number;
      unique_viewers: string | number;
    }>;

    const totalsRows = (await totalsResult.json()) as Array<{
      impressions: string | number;
      unique_viewers: string | number;
    }>;

    const totalsRow = totalsRows[0];

    return {
      success: true,
      data: {
        series: seriesRows.map((r) => ({
          date: String(r.date),
          impressions: Number(r.impressions),
          unique_viewers: Number(r.unique_viewers),
        })),
        totals: {
          impressions: Number(totalsRow?.impressions ?? 0),
          unique_viewers: Number(totalsRow?.unique_viewers ?? 0),
        },
        reactions,
        bookmarks,
        clickhouseConfigured: true,
        publishedArticleCount: articleIds.length,
        publicGistCount: gistIds.length,
      },
    };
  } catch (error) {
    return handleActionException(error);
  }
}
