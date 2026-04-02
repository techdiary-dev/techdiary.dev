# TechDiary

A modern blogging platform designed specifically for the tech community. Built for developers, by developers.

![TechDiary](public/og.png)

## Overview

TechDiary is a feature-rich blogging platform that empowers developers and tech enthusiasts to share knowledge, document their journey, and build meaningful connections within the tech community. With support for multiple languages, intuitive writing tools, and powerful engagement features, TechDiary creates the perfect environment for technical content creation and discovery.

## Key features

### Content creation
- **Rich Markdown editor** with Markdoc parsing, live preview, and auto-save
- **Drag-and-drop image upload** with cropping (Cloudinary and Cloudflare R2)
- **Series support** for organizing related articles
- **Draft management** with periodic autosave
- **SEO** with meta tags and structured data

### Gists
- **Code snippets** with multiple files, browsing, and sharing (`/gists`)

### Multi-language support
- **Bengali and English** UI (dictionary for Bengali; English uses keys as fallback)
- **Localized formatting** for dates and numbers where applicable
- **Language preference** persisted via cookie and client state

### Search
- **Full-text search** powered by Meilisearch
- **Filtering** by tags, authors, and dates
- **Fast, typo-tolerant** queries

### Engagement
- **Emoji reactions** (Love, Fire, Wow, Haha, Cry, Unicorn)
- **Threaded comments**
- **Bookmarks** and **following** authors
- **In-app notifications** with background processing (Inngest)
- **Realtime updates** over the Pusher protocol; use [Pusher](https://pusher.com/) or self-host **[Soketi](https://soketi.app/)** (open-source, drop-in compatible) for selective UI refresh

### Authentication
- **WorkOS AuthKit** as the primary sign-in path
- **GitHub OAuth** available as a legacy alternative
- **Secure sessions** stored in PostgreSQL with HTTP-only cookies

### UI
- **Dark/light theme**
- **Responsive layout**
- **Web app manifest** and service worker registration for installable / app-like behavior

## Tech stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** — App Router, React Server Components, Turbopack in dev (`next dev --turbo`)
- **[React 19](https://react.dev/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Tailwind CSS 4](https://tailwindcss.com/)**
- **[shadcn/ui](https://ui.shadcn.com/)** — Radix-based components

### Backend and data
- **[Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)** — primary server API surface
- **[SQLKit](https://github.com/sqlkit-dev/sqlkit)** — lightweight query builder for most database access
- **[Drizzle ORM](https://orm.drizzle.team/)** — schema and migrations only (`db:generate` / `db:push`)
- **[PostgreSQL](https://www.postgresql.org/)** — primary database

### Search, storage, and jobs
- **[Meilisearch](https://www.meilisearch.com/)** — search index and queries
- **[Cloudflare R2](https://developers.cloudflare.com/r2/)** — S3-compatible uploads (presigned URLs)
- **[Cloudinary](https://cloudinary.com/)** — image URLs and transforms (legacy paths)
- **[Inngest](https://www.inngest.com/)** — scheduled jobs (e.g. article cleanup) and notification queueing
- **Pusher-compatible WebSockets** — managed Pusher or self-hosted **[Soketi](https://soketi.app/)** (same wire protocol and client libraries; point `PUSHER_*` / `NEXT_PUBLIC_PUSHER_*` at your Soketi host)

### Client state and forms
- **[Jotai](https://jotai.org/)** — client UI state
- **[TanStack Query](https://tanstack.com/query)** — server state and cache invalidation
- **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** — forms and validation

### Tooling
- **[Bun](https://bun.sh/)** — scripts and package management (Node-compatible)
- **[ESLint](https://eslint.org/)** — `eslint-config-next`
- **[Prettier](https://prettier.io/)** — formatting

## Quick start

### Prerequisites
- **Bun** (recommended) or **Node.js 22+** (aligned with dev dependencies)
- **PostgreSQL 14+**
- **Meilisearch** instance
- **WorkOS** account (AuthKit) for primary login, and/or **GitHub OAuth** app for legacy flow
- **Cloudinary** and/or **Cloudflare R2** for uploads (see env below)

### Environment variables

Create a `.env.local` in the project root. Required variables are validated in [`src/env.ts`](src/env.ts) at runtime; WorkOS is used by AuthKit alongside those (see [`CLAUDE.md`](CLAUDE.md)).

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/techdiary"

# WorkOS (primary auth — AuthKit)
WORKOS_API_KEY=""
WORKOS_CLIENT_ID=""
WORKOS_COOKIE_PASSWORD=""
NEXT_PUBLIC_WORKOS_REDIRECT_URI="http://localhost:3000/api/auth/wos/callback"

# GitHub OAuth (legacy)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GITHUB_CALLBACK_URL="http://localhost:3000/api/auth/github/callback"

# Unsplash (required by env schema — used for integrations)
UNSPLASH_API_KEY=""

# Cloudinary
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

# Cloudflare R2 (S3-compatible — names match src/env.ts)
S3_ENDPOINT=""
S3_REGION="auto"
S3_BUCKET=""
S3_ACCESS_KEY_ID=""
S3_ACCESS_SECRET=""

# Meilisearch
MEILISEARCH_ADMIN_API_KEY=""
NEXT_PUBLIC_MEILISEARCH_API_HOST="http://localhost:7700"
NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY=""

# Inngest (optional in schema — omit or leave empty for local-only)
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""

# Realtime: Pusher SaaS or self-hosted Soketi (drop-in Pusher replacement — same env names)
PUSHER_WS_HOST=""
PUSHER_APP_ID=""
PUSHER_APP_KEY=""
PUSHER_APP_SECRET=""
NEXT_PUBLIC_PUSHER_APP_KEY=""
NEXT_PUBLIC_PUSHER_WS_HOST=""
```

### Installation and setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/techdiary-dev/techdiary.dev.git
   cd techdiary.dev
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Database**
   ```bash
   bun run db:generate   # generate migrations from schema when you change Drizzle tables
   bun run db:push       # apply schema to your database
   ```

4. **Development server**
   ```bash
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|--------|-------------|
| `bun run dev` | Dev server with Turbopack |
| `bun run build` | Production build |
| `bun run start` | Production server |
| `bun run lint` | ESLint |
| `bun run db:generate` | Drizzle migrations from `schemas.ts` |
| `bun run db:push` | Push schema to DB |
| `bun run db:studio` | Drizzle Studio |
| `bun run play` | Backend playground (`src/backend/play.ts`) |

## Project structure

```
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (home)/               # Homepage and feed
│   │   ├── (dashboard-editor)/   # Editor-related dashboard routes
│   │   ├── dashboard/            # Dashboard layout
│   │   ├── gists/                # Gists (list, create, view)
│   │   ├── [username]/           # Profiles and article pages
│   │   ├── api/                  # API routes (auth, storage, etc.)
│   │   └── sitemaps/             # Dynamic sitemaps
│   ├── backend/
│   │   ├── models/               # Domain types and action contracts
│   │   ├── persistence/          # Drizzle schemas, SQLKit repositories, PG client
│   │   └── services/             # Server actions, inputs (Zod), integrations
│   ├── components/               # UI and feature components
│   ├── hooks/
│   ├── i18n/
│   ├── lib/
│   ├── store/                    # Jotai atoms
│   └── styles/
├── docs/                         # Internal docs (components, hooks, PRD)
├── public/
└── migrations/                   # Generated SQL migrations
```

## Architecture notes

- **Server actions** return a consistent `ActionResponse<T>` union; TanStack Query calls actions directly from the client where appropriate.
- **Caching** uses Next.js Cache Components / Partial Prerendering; user-specific data stays dynamic (cookies, session).
- **Article soft-delete** uses `delete_scheduled_at`; cleanup runs on an Inngest schedule.

## Documentation

- **[Component docs](docs/components/README.md)**
- **[Hooks docs](docs/hooks/README.md)**
- **[PRD](docs/PRD.md)**
- **Agent / contributor reference:** [CLAUDE.md](CLAUDE.md) (commands, env vars, auth flow, caching rules)

## Deployment

- **Runtime:** Node-compatible host for Next.js (e.g. Vercel) or your platform of choice.
- **Data:** Managed PostgreSQL; Meilisearch (cloud or self-hosted).
- **Auth:** Set WorkOS production redirect URI and cookie secret; align `NEXT_PUBLIC_WORKOS_REDIRECT_URI` with your domain.
- **Storage:** R2 credentials and/or Cloudinary for production URLs.
- **Inngest:** Configure event and signing keys for production workers.

## Contributing

1. Fork the repository and create a branch for your change.
2. Follow existing TypeScript, ESLint, and formatting conventions.
3. There is **no automated test suite** in this repo; use `bun run play` to exercise backend code when needed.
4. Open a pull request with a clear description.

For deeper conventions (actions, repositories, i18n), see [CLAUDE.md](CLAUDE.md).

## License

[MIT](LICENSE)

## Acknowledgments

Next.js, shadcn/ui, Meilisearch, WorkOS, and the open-source ecosystem this project builds on.

## Links

- **Site:** [techdiary.dev](https://techdiary.dev)
- **Community:** [Discord](https://go.techdiary.dev/discord)
- **Issues:** [GitHub](https://github.com/techdiary-dev/techdiary.dev/issues)
- **Email:** hello@techdiary.dev

---

<div align="center">

**Built with care by the TechDiary team**

[Star this repo](https://github.com/techdiary-dev/techdiary.dev) · [Report a bug](https://github.com/techdiary-dev/techdiary.dev/issues) · [Request a feature](https://github.com/techdiary-dev/techdiary.dev/issues)

</div>
