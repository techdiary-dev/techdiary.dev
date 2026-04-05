# Resource analytics plan

This document describes **general resource analytics** for TechDiary: view events and time-series insights for any trackable `(resource_type, resource_id)`, not only articles. It extends the intent of [GitHub issue #114](https://github.com/techdiary-dev/techdiary.dev/issues/114) and the writer-analytics line item in `comeback-strategy.md`.

---

## Goals

- Give **owners** visibility into **reach** (views over time) for content they control.
- Reuse the same **polymorphic resource keys** the app already uses for reactions, bookmarks, and comments (`resource_type` + `resource_id`).
- Keep **heavy write traffic** off PostgreSQL by storing view events in **ClickHouse** (or an equivalent columnar/analytics store).

Non-goals for v1:

- Real-time public view counters on every page.
- Analytics for resources the current user does not own (except future admin tooling).
- Perfect “read time” without client instrumentation (optional later via scroll/time signals).

---

## Product surface

- **Dashboard (or editor)** entry: “Insights” / “Analytics” for a resource the user owns.
- **Summary cards:** **impressions** (every append / page load in range) and **unique viewers** (`uniq(session_id)` in range); optional all-time headlines from ClickHouse.
- **Time-series chart:** primary line = **unique viewers per day**; optional second series or toggle = **impressions per day** (see [Metrics](#metrics-impressions-vs-unique-viewers)). Range **7d / 30d / 90d** (default **30d** per #114).
- **Engagement from Postgres:** reaction count and bookmark count where the schema supports that `resource_type` (today: **ARTICLE**, **GIST** for reactions; bookmarks per existing `bookmarks` rules).

First consumer: **published article** detail views. Second: **gist** public views, using the same pipeline.

---

## Data model (ClickHouse)

Single events table keyed by resource, not by article only.

```sql
CREATE TABLE resource_views (
  resource_type   LowCardinality(String), -- e.g. ARTICLE, GIST (allowlist)
  resource_id     UUID,
  session_type    LowCardinality(String), -- ANON | AUTHENTICATED
  session_id      String,                 -- ANON: client token; AUTHENTICATED: user id (UUID string)
  referrer        Nullable(String),
  country_code    Nullable(String),
  viewed_at       DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(viewed_at)
ORDER BY (resource_type, resource_id, viewed_at);
```

Existing tables with `viewer_id`: run these **one statement per HTTP request** (or `clickhouse-client`), in order:

1. `migrations/clickhouse-migrate-session-type-1-add-column.sql`
2. `migrations/clickhouse-migrate-session-type-2-backfill.sql`
3. `migrations/clickhouse-migrate-session-type-3-drop-viewer.sql`

**Deduped “views” metric (v1):** `uniq(session_id)` per calendar day per resource, for a chosen window:

```sql
SELECT
  toDate(viewed_at) AS date,
  uniq(session_id)  AS views
FROM resource_views
WHERE resource_type = {type:String}
  AND resource_id = {id:UUID}
  AND viewed_at >= now() - INTERVAL 30 DAY
GROUP BY date
ORDER BY date;
```

Adjust interval via app-level parameter (7 / 30 / 90 / custom).

### Metrics: impressions vs unique viewers

Append-on-each-load stores **one row per event**. That supports **two KPIs from the same table** without changing ingestion:

| Metric             | Meaning                                                                                            | Per-day aggregation |
| ------------------ | -------------------------------------------------------------------------------------------------- | ------------------- |
| **Impressions**    | Total times the page was loaded and sent an event (includes refreshes, repeat loads same session). | `count()`           |
| **Unique viewers** | Distinct sessions that saw the resource at least once that day.                                    | `uniq(session_id)`  |

**Single query — daily series for both** (same filter as above):

```sql
SELECT
  toDate(viewed_at)     AS date,
  count()               AS impressions,
  uniq(session_id)      AS unique_viewers
FROM resource_views
WHERE resource_type = {type:String}
  AND resource_id = {id:UUID}
  AND viewed_at >= now() - INTERVAL 30 DAY
GROUP BY date
ORDER BY date;
```

**Range totals** (summary cards): `sum(impressions)` and `sum(unique_viewers)` over the returned daily rows, or a separate aggregate query with the same `WHERE` and `count()` / `uniq(session_id)` over the whole window (note: `uniq` across the whole window is not the same as summing daily uniques — use **one global `uniq(session_id)`** for “unique viewers in period” if you want strict uniques; use **sum of daily uniques** if you want “approximate reach by day” stacked; document which you show).

**Recommendation for v1 summary:** report **unique viewers in period** as `uniq(session_id)` with the date filter only (one number), and **impressions in period** as `count()` with the same filter.

---

## Ingestion

### HTTP API

- **Route:** `POST /api/analytics/view` (or `pageview` if you prefer naming parity with #114).
- **Body (JSON):** `{ "resource_type": "ARTICLE", "resource_id": "<uuid>", "session_id": "<string>" }`. The server sets **`session_type`** and the canonical **`session_id`**: if the user is logged in, `session_type = AUTHENTICATED` and `session_id = user id`; otherwise `session_type = ANON` and `session_id` is the client token from the body.
- **Behavior:** validate allowlist + UUID, insert one row, return **204** quickly. Optionally use **wait_end_of_query: false** (or fire-and-forget pattern) so the client never blocks on ClickHouse latency.

### Client

- **Fire-and-forget** `fetch` on the **public** resource page (article read, gist read) inside a small client component mounted once per page.
- **Session id:** anonymous stable id from a long-lived cookie or `localStorage` + fallback; if logged in, still send `session_id` for dedupe and optionally set `viewer_id` from server-side context if the route chooses to enrich (or leave enrichment to a later iteration).

### Allowlist

Reject unknown `resource_type` values at the API to avoid garbage dimensions. Start with: `ARTICLE`, `GIST`. Expand deliberately (e.g. `SERIES`) when there is a clear owner and a public URL.

### Abuse / noise

- Rate limit by IP at the edge or in the route (follow existing API patterns).
- Optional: drop obvious bots via `User-Agent` heuristics later.

---

## Read path (server)

### Server action (or cached query helper)

- **Name:** e.g. `getResourceAnalytics({ resource_type, resource_id, rangeDays })`.
- **Steps:**
  1. Resolve current user (`authID()`).
  2. **Assert ownership** for `(resource_type, resource_id)` via a small internal map:
     - `ARTICLE` → author_id matches user.
     - `GIST` → owner matches user.
     - (Future types → same pattern.)
  3. Run the ClickHouse aggregation query.
  4. Optionally merge **reaction** / **bookmark** counts from SQLKit repositories for that resource.

Return a typed payload, e.g. `{ series: { date, impressions, unique_viewers }[], totals: { impressions, unique_viewers }, reactions: number, bookmarks: number }` (shape can evolve). Chart can default to **unique viewers** with impressions as secondary or toggle.

**Caching:** read-only, user-specific data — **do not** use `'use cache'` on functions that call `cookies()` / session. Per-request or short-lived client cache (TanStack Query) is appropriate.

---

## Code layout (suggested)

| Area                        | Path / artifact                                                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| ClickHouse client singleton | `src/backend/persistence/clickhouse.client.ts`                                                                                     |
| Analytics server actions    | `src/backend/services/analytics.actions.ts`                                                                                        |
| Zod input                   | `src/backend/services/inputs/analytics.input.ts`                                                                                   |
| Ingest route                | `src/app/api/analytics/view/route.ts`                                                                                              |
| Client tracker              | e.g. `src/components/analytics/ResourceViewTracker.tsx`                                                                            |
| Chart                       | e.g. `src/components/analytics/ResourceAnalyticsChart.tsx` (Recharts or existing chart lib)                                        |
| Dashboard page              | e.g. `src/app/(dashboard-editor)/dashboard/analytics/[resourceType]/[resourceId]/page.tsx` or nested under article/gist edit flows |

Keep **ownership checks** in one module (e.g. `assertResourceAnalyticsAccess`) so new resource types only add a branch there.

---

## Environment variables

Add to the server env schema (e.g. `@t3-oss/env-nextjs`):

- `CLICKHOUSE_HOST` (hostname only, no protocol)
- `CLICKHOUSE_PORT` (optional, default `8123` in code)
- `CLICKHOUSE_DATABASE` (optional, default `default`)
- `CLICKHOUSE_USERNAME`
- `CLICKHOUSE_PASSWORD`
- `CLICKHOUSE_SECURE` — `true` | `false` for `https://` vs `http://`

DDL for the events table lives in `migrations/clickhouse-schema.sql` (run once against the instance).

When vars are missing, ingest route should **no-op or 503** consistently; dashboard should show a clear “analytics unavailable” state so local dev without ClickHouse still runs.

---

## Dependencies

- `@clickhouse/client` — official client for insert/query.

---

## Rollout order

1. Provision ClickHouse (Cloud or Docker) and create `resource_views`.
2. Add env vars + `clickhouse.client.ts` + connection health check (optional).
3. Implement `POST /api/analytics/view` with allowlist validation.
4. Add `ResourceViewTracker` to **published article** page (and optionally gist page).
5. Implement `getResourceAnalytics` + ownership assertions.
6. Build dashboard UI: summary cards (**impressions** + **unique viewers**) + range toggle + chart (unique viewers primary; impressions optional second series or toggle).
7. Wire entry points from article editor / dashboard nav.
8. Production monitoring: insert errors, query latency, row growth.

---

## Relationship to PostgreSQL

- **Authoritative for identity and engagement:** users, articles, gists, reactions, bookmarks remain in Postgres.
- **Analytics store:** append-only view events; cheap `count()` and `uniq(session_id)` per day.
- **Issue #114 acceptance criteria** map as follows:
  - View count / time series → ClickHouse: **unique viewers** time series (`uniq(session_id)` by day); **impressions** (`count()` by day) from the same rows.
  - Reaction and bookmark counts → existing repositories by `resource_type` / `resource_id`.
  - “Estimated reads” → future enhancement (scroll depth, time-on-page); not required for v1.

---

## Open decisions

- **Public view counter:** whether to show aggregate views on the article page (requires either a cached aggregate job or a separate materialized summary).
- **GDPR / retention:** retention window for `resource_views` and deletion story when a user or resource is removed (ClickHouse TTL or periodic cleanup).
- **Cross-resource dashboard:** one page listing “all my content” with sparklines — nice follow-up after single-resource insights ship.
