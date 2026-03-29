# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development Server

- `bun run dev` - Start development server with Turbo
- Open http://localhost:3000 to view the application

### Database Operations

- `bun run db:generate` - Generate database migrations from schema changes
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Drizzle Studio (database GUI)

### Build & Deployment

- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint checks

### Backend Development

- `bun run play` - Run backend playground script (`src/backend/play.ts`)

## Architecture Overview

### Technology Stack

- **Frontend**: Next.js (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Backend**: Next.js Server Actions, Drizzle ORM (migrations only)
- **Database**: PostgreSQL
- **Authentication**: GitHub OAuth
- **Search**: MeilSearch
- **File Storage**: Cloudinary / Cloudflare R2
- **State Management**: Jotai, TanStack Query, React Hook Form with Zod validation

### Backend & Database

- **[SQLKit](https://github.com/sqlkit-dev/sqlkit)** - Very light sql query builder, we are using most of the sql query using this.
- **[Drizzle ORM](https://orm.drizzle.team/)** - Awesome sql tool but we are only using for migration
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Backend API

### Core Directory Structure

#### Frontend (`/src/app/`)

- Route groups using Next.js App Router:
  - `(home)` - Main homepage and article feed
  - `(dashboard-editor)` - Protected dashboard routes
  - `[username]` - User profile pages
  - `[username]/[articleHandle]` - Individual article pages
- API routes in `/api/` for OAuth and development

#### Backend (`/src/backend/`)

- **Models** (`/models/`) - Domain interfaces (`domain-models.ts`) and `ActionResponse<T>` contract
- **Persistence** (`/persistence/`) - Database schemas (`schemas.ts`), SQLKit repositories (`persistence-repositories.ts`), and PostgreSQL client (`clients.ts`)
- **Services** (`/services/`) - Server actions (business logic), each paired with Zod input schemas in `/services/inputs/`

#### Component Architecture (`/src/components/`)

- **UI Components** - shadcn/ui based design system
- **Feature Components** - Domain-specific (Editor, Navbar, etc.)
- **Layout Components** - Page layouts and providers

### Database Schema Architecture

Key entities and their relationships:

- **Users** - User profiles with social authentication
- **Articles** - Blog posts with markdown content and metadata
- **Series** - Article collections/sequences
- **Comments** - Nested commenting system with resource association
- **Tags** - Article categorization
- **Bookmarks** - User content saving
- **Reactions** - Emoji-based reactions (LOVE, FIRE, WOW, etc.)
- **User Sessions** - Session management
- **User Socials** - OAuth provider connections

### Content Management

- **Rich Text**: Markdoc for markdown parsing and rendering
- **File Uploads**: Cloudinary integration for images/media
- **Search**: MeilSearch for full-text search capabilities
- **Internationalization**: Custom i18n implementation (Bengali/English)

### State Management Patterns

- **Server State**: TanStack Query for data fetching in components
- **Client State**: Jotai atoms (`src/store/`) for global UI state
- **Form State**: React Hook Form with Zod validation
- **Environment**: Type-safe environment variables with @t3-oss/env-nextjs

## Required Environment Variables

Server-side:

- `DATABASE_URL` - PostgreSQL connection string
- `WORKOS_API_KEY` - WorkOS API key
- `WORKOS_CLIENT_ID` - WorkOS client ID
- `WORKOS_COOKIE_PASSWORD` - WorkOS session cookie encryption key
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID (legacy flow)
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret (legacy flow)
- `GITHUB_CALLBACK_URL` - GitHub OAuth callback URL (legacy flow)
- `CLOUDINARY_URL` - Cloudinary configuration
- `MEILISEARCH_ADMIN_API_KEY` - MeilSearch admin API key

Client-side:

- `NEXT_PUBLIC_WORKOS_REDIRECT_URI` - WorkOS callback URL
- `NEXT_PUBLIC_MEILISEARCH_API_HOST` - MeilSearch API host URL
- `NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY` - MeilSearch search API key

## Key Features Implementation

### Authentication Flow

The app uses **WorkOS** (`@workos-inc/authkit-nextjs`) as the primary auth provider, with **GitHub OAuth** as an alternative.

**WorkOS flow:**

1. `GET /api/auth/login?next=<url>` — generates WorkOS sign-in URL via `getSignInUrl()`, stores redirect target in session, redirects user to WorkOS
2. `GET /api/auth/wos/callback?code=...` — exchanges code for user info via `workos.userManagement.authenticateWithCode()`, runs `bootWorkOSUser()` to upsert the local user record, then calls `createLoginSession()`
3. `GET /api/auth/logout` — deletes DB session, clears cookies, calls WorkOS `signOut()`

**`bootWorkOSUser()` upsert logic** (`src/backend/services/user.action.ts`):

- If a user with matching `auth_id` exists → return it
- If a user with matching email exists → update their `auth_id` and return
- Otherwise → create a new user

**Local session** (`src/backend/services/session.actions.ts`):

- `createLoginSession()` generates a 120-char random token, stores it in `user_sessions` table with device/IP info, sets two `httpOnly` cookies: `session_token` and `session_userId`
- `getSession()` reads the token cookie, validates against DB, and returns `{session, user}` — memoized per request via React `cache()`
- `authID()` reads `session_userId` cookie directly for fast user ID lookups

**Layout**: `src/app/layout.tsx` wraps the app in `<AuthKitProvider>` and calls `getSession()` server-side on every request.

**Key env vars for WorkOS**: `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `WORKOS_COOKIE_PASSWORD`, `NEXT_PUBLIC_WORKOS_REDIRECT_URI`

### Content Creation

- Rich markdown editor with drag-and-drop support
- Image upload and optimization via Cloudinary
- Article series management for content organization
- Tag-based categorization system

### Search Implementation

- MeilSearch for full-text search across articles
- Search configuration and indexing handled in backend services
- Client-side search interface with real-time results

### Community Features

- Nested commenting system with resource association
- Emoji-based reactions (LOVE, FIRE, WOW, etc.)
- User following and bookmarking functionality
- Social sharing and user profiles

## Backend Actions Structure (`src/backend/`)

### Layers

```
src/backend/
├── models/
│   ├── action-contracts.ts       # ActionResponse<T> discriminated union
│   └── domain-models.ts          # All domain interfaces (User, Article, etc.)
├── persistence/
│   ├── schemas.ts                # Drizzle table definitions (used for migrations only)
│   ├── clients.ts                # PostgreSQL pool (SQLKit) + Drizzle client singletons
│   └── persistence-repositories.ts  # SQLKit Repository instances keyed by entity
└── services/
    ├── *.actions.ts / *.service.ts   # Server actions ("use server")
    ├── inputs/                   # Zod schemas per domain
    ├── oauth/                    # OAuth implementations
    ├── RepositoryException.ts    # Error handling utilities
    └── action-type.ts            # Session types & cookie key enums
```

### Return type — `ActionResponse<T>`

Every action returns this discriminated union (defined in `models/action-contracts.ts`):

```ts
type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

Check `response.success` before accessing `response.data`.

### Repositories — `persistenceRepository`

All DB access goes through SQLKit `Repository` instances exported from `persistence-repositories.ts`:

```ts
persistenceRepository.article.insert([data])
persistenceRepository.article.update({ ... })
persistenceRepository.article.paginate({ where, orderBy, limit, page })
persistenceRepository.article.find({ where, columns, joins })
```

Available repositories: `user`, `userSocial`, `userSession`, `article`, `bookmark`, `comment`, `reaction`, `articleTagPivot`, `tags`, `series`, `seriesItems`, `kv`.

For complex multi-join queries, raw SQL is executed directly via `pgClient.executeSQL()`.

### Anatomy of an action

```ts
"use server";

export async function updateMyArticle(
  input: z.infer<typeof ArticleRepositoryInput.updateMyArticleInput>,
): Promise<ActionResponse<Article>> {
  try {
    // 1. Validate input
    const payload =
      await ArticleRepositoryInput.updateMyArticleInput.parseAsync(input);

    // 2. Authorize
    const userId = await authID();
    if (!userId) throw new ActionException("Unauthorized");

    // 3. Call repository
    const [article] = await persistenceRepository.article.update({
      data: removeUndefinedFromObject(payload),
      where: and(eq("id", payload.article_id), eq("author_id", userId)),
    });

    // 4. Side effects (search sync, tag sync, etc.)
    if (article.published_at) await syncArticleById(article.id);

    // 5. Return success
    return { success: true, data: article };
  } catch (error) {
    return handleActionException(error); // always returns { success: false, error: string }
  }
}
```

### Error handling — `handleActionException`

`RepositoryException.ts` exports:

- **`handleActionException(error)`** — catches `ZodError` (formats field messages), `ActionException` (domain errors), and generic `Error`; always returns `{ success: false, error: string }`.
- **`ActionException`** — throw this for authorization or domain validation failures (e.g. `throw new ActionException("Unauthorized")`).

### Input validation — `services/inputs/`

Each domain has a Zod schema file (e.g. `article.input.ts`). Schemas are always called with `parseAsync()` inside the action, never `parse()`. Common patterns:

```ts
// Optional fields with transformation
metadata: z.object({
  seo: z.object({
    canonical_url: z
      .union([z.string().url(), z.literal(""), z.null()])
      .transform((v) => (v === "" ? null : v)),
  }),
});
```

### Pagination

`repository.paginate()` returns `{ nodes: T[], meta: { currentPage, hasNextPage, ... } }`. Feed actions follow this interface consistently.

## Server Actions + TanStack Query Pattern

Server actions (`"use server"` in `src/backend/services/`) are called **directly** inside TanStack Query's `queryFn` / `mutationFn` — no API routes needed for data fetching.

**Reading data — `useQuery`:**

```ts
const sessionQuery = useQuery({
  queryKey: ["mySessions"],
  queryFn: () => sessionActions.mySessions(),
});
```

**Writing data — `useMutation`:**

```ts
const mutation = useMutation({
  mutationFn: (payload) => userActions.updateMyProfile(payload),
  onSuccess: () => toast("Saved"),
});
```

**Paginated data — `useInfiniteQuery`:**

```ts
const feedQuery = useInfiniteQuery({
  queryKey: ["article-feed", feedType],
  queryFn: ({ pageParam }) =>
    articleActions.articleFeed({ page: pageParam, limit: 5 }),
  initialPageParam: 1,
  getNextPageParam: (lastPage) =>
    lastPage?.meta.hasNextPage ? lastPage.meta.currentPage + 1 : undefined,
});
// Access data: feedQuery.data?.pages.flatMap(p => p?.nodes)
```

**Optimistic updates** (see `ResourceReactionable.tsx`): use `onMutate` to update the cache immediately, `onError` to roll back, and `onSettled` to call `queryClient.invalidateQueries()`.

**QueryKey conventions:**

- Simple: `["mySessions"]`
- With param: `["bookmark-status", resource_id]`
- With multiple params: `["reaction", resource_id, resource_type]`

**TanStack Query client** is configured in `src/lib/tanstack-query.client.ts` with `refetchOnWindowFocus: false`.

## Development Workflow

1. Database changes require running `bun run db:generate` followed by `bun run db:push`
2. Backend logic testing can be done via `bun run play` playground script
3. Type safety is enforced through Zod schemas for all inputs
4. UI components follow shadcn/ui patterns and conventions
5. All forms use React Hook Form with Zod validation schemas
6. When querying data in component always use Tanstack Query.
7. When interacting with DB, create a action in `src/backend/services` and use sqlkit package (https://github.com/sqlkit-dev/sqlkit)
8. For Database schema reference look here for drizzle schema `src/backend/persistence/schemas.ts`

## Special Considerations

- **Bengali Language Support**: Custom font loading (Kohinoor Bangla) and i18n in `src/i18n/`
- **SEO Optimization**: Dynamic sitemaps in `src/app/sitemaps/`, Open Graph tags, and schema markup
- **No test framework**: There are no automated tests — use `bun run play` for backend experimentation
- **Cloudflare Workers**: `wrangler.toml` is present; `bun run wrangler:dev` starts the worker locally

## Caching & ISR (Incremental Static Regeneration)

The app uses Next.js 16 **Cache Components** (`cacheComponents: true` in `next.config.ts`). All routes render as **Partial Prerender (`◐`)** — the static HTML shell is prerendered at build time; dynamic parts (session, language) stream in via `<Suspense>`.

### Rules

**1. Data fetching functions that are safe to cache (no `cookies()`/`headers()` calls) must use `'use cache'`:**

```ts
// In a "use server" file — 'use cache' at function level is valid
export async function articleDetailByHandle(handle: string) {
  "use cache";
  cacheLife("hours"); // optional: override default 15min revalidate
  cacheTag(`article-${handle}`); // optional: enable on-demand invalidation
  // ... DB query
}
```

**2. Set cache lifetime with `cacheLife()` (call inside the `'use cache'` function):**

| Profile | Stale | Revalidate | Use for |
|---|---|---|---|
| `"seconds"` | 0s | 1s | near-realtime |
| `"minutes"` | 1min | 1min | frequently updated |
| `"hours"` | 5min | 1hr | articles, profiles |
| `"days"` | 1hr | 1day | tags, static content |
| `"weeks"` | 1day | 1wk | rarely updated |
| `"max"` | 30d | 30d | immutable content |

**3. Tag cache entries with `cacheTag()` and bust on mutation with `revalidateTag()`:**

```ts
// Reader — tag the cache entry
export async function articleDetailByHandle(handle: string) {
  "use cache";
  cacheTag(`article-${handle}`);
  // ...
}

// Writer — bust it immediately after update/publish
export async function updateMyArticle(input) {
  // ... update DB
  revalidateTag(`article-${payload.handle}`);
}
```

**4. Functions that read `cookies()` or `headers()` can NEVER use `'use cache'`** — they must stay dynamic and be wrapped in `<Suspense>` in the layout/page. Examples: `getSession()`, `authID()`, `LanguageHydrator`.

**5. Dashboard/auth-protected pages** are always dynamic — do not add `'use cache'` to user-specific data fetching (bookmarks, sessions, notifications).

### What NOT to do

- Do NOT use `export const revalidate = N` on pages — it conflicts with `cacheComponents: true`
- Do NOT add `'use cache'` to functions that call `cookies()` or `headers()` — it will throw a build error
- Do NOT add `'use cache'` to mutation actions (`createX`, `updateX`, `deleteX`)

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.
