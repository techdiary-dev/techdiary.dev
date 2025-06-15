# Cloudflare Cron Setup for Article Cleanup

This document explains how to set up Cloudflare Cron Triggers to automatically delete expired articles.

## Overview

The system consists of:
1. **API Route**: `/api/cron/cleanup-articles` - Handles the actual cleanup logic
2. **Cloudflare Worker**: `src/workers/cron-worker.ts` - Cron trigger that calls the API
3. **Backend Service**: `src/backend/services/article-cleanup-service.ts` - Database operations

## Setup Instructions

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
# or
bun install -g wrangler
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

### 3. Configure Environment Variables

Update `wrangler.toml` with your actual domain:

```toml
[vars]
CRON_TARGET_URL = "https://your-actual-domain.com/api/cron/cleanup-articles"
```

### 4. Set Secret (Optional but Recommended)

For additional security, set a secret that the cron worker will send:

```bash
wrangler secret put CRON_SECRET
# Enter your secret when prompted
```

Then add the same secret to your Next.js environment:

```bash
# .env.local
CRON_SECRET=your-secret-key
```

### 5. Deploy the Cron Worker

```bash
wrangler deploy src/workers/cron-worker.ts
```

### 6. Verify Cron Schedule

The cron is configured to run daily at 2:00 AM UTC. You can modify the schedule in `wrangler.toml`:

```toml
[triggers]
crons = [
  "0 2 * * *"  # Daily at 2:00 AM UTC
]
```

Other common schedules:
- `"0 * * * *"` - Every hour
- `"0 2 * * 0"` - Every Sunday at 2:00 AM
- `"0 2 1 * *"` - First day of every month at 2:00 AM

### 7. Monitor Cron Executions

You can monitor executions in the Cloudflare dashboard:
1. Go to Workers & Pages
2. Select your worker
3. Check the "Logs" tab for execution logs

## Manual Testing

You can test the cleanup manually by calling the API directly:

```bash
# GET request for testing
curl https://your-domain.com/api/cron/cleanup-articles

# POST request (mimics cron call)
curl -X POST https://your-domain.com/api/cron/cleanup-articles \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: your-secret-key"
```

## How It Works

1. **Article Scheduling**: Articles can be scheduled for deletion by setting the `delete_scheduled_at` field
2. **Cron Trigger**: Cloudflare runs the worker daily at 2:00 AM UTC
3. **API Call**: Worker calls `/api/cron/cleanup-articles` endpoint
4. **Cleanup Logic**: Service finds articles where `delete_scheduled_at < current_time` and deletes them
5. **Response**: API returns count of deleted articles and their details

## Database Schema

Articles are scheduled for deletion using the `delete_scheduled_at` timestamp field:

```sql
-- Example of scheduling an article for deletion in 30 days
UPDATE articles 
SET delete_scheduled_at = NOW() + INTERVAL '30 days'
WHERE id = 'article-id';
```

## Additional Functions

The cleanup service also provides:
- `scheduleArticleForDeletion(articleId, deleteAt)` - Schedule an article
- `cancelScheduledDeletion(articleId)` - Cancel scheduled deletion  
- `getScheduledArticles()` - Get all articles scheduled for deletion

## Troubleshooting

### Common Issues

1. **404 Error**: Check that your `CRON_TARGET_URL` is correct
2. **401 Unauthorized**: Verify `CRON_SECRET` matches between worker and API
3. **500 Error**: Check database connection and permissions
4. **No Articles Deleted**: Verify articles have `delete_scheduled_at` set and are past due

### Debugging

1. Check Cloudflare Worker logs in the dashboard
2. Check your Next.js application logs
3. Test the API endpoint manually
4. Verify database records with `getScheduledArticles()`

## Security Considerations

1. Use `CRON_SECRET` to verify requests come from your worker
2. Consider rate limiting the endpoint
3. Log all cleanup operations for audit trails
4. Ensure proper database permissions for the cleanup operations