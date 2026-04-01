# Article Cleanup Cron Setup

> **Note**: The Cloudflare Worker cron for article cleanup has been retired.
> Article cleanup is now handled by an **Inngest cron function** that runs daily at 2:00 AM UTC.

## Current Setup

Article cleanup runs as an Inngest cron function registered at `/api/inngest`.

- **Function ID**: `cleanup-expired-articles`
- **Schedule**: `0 2 * * *` (daily at 2:00 AM UTC)
- **Source**: `src/lib/inngest.ts` → `cleanupExpiredArticlesFn`
- **Logic**: `src/backend/services/article-cleanup-service.ts` → `deleteExpiredArticles()`

## Manual Runs

Trigger a manual run from the [Inngest dashboard](https://app.inngest.com) by invoking the `cleanup-expired-articles` function.

## How It Works

1. **Article Scheduling**: Articles can be scheduled for deletion by setting the `delete_scheduled_at` field
2. **Inngest Cron**: Inngest triggers the function daily at 2:00 AM UTC
3. **Cleanup Logic**: `deleteExpiredArticles()` finds articles where `delete_scheduled_at < current_time` and deletes them from the database and MeiliSearch

## Required Environment Variables

- `INNGEST_EVENT_KEY` — Inngest event key (optional for local dev)
- `INNGEST_SIGNING_KEY` — Inngest signing key (optional for local dev)
