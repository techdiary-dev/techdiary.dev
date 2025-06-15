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
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: GitHub OAuth
- **Search**: MeilSearch
- **File Storage**: Cloudinary
- **State Management**: Jotai, React Hook Form with Zod validation

### Core Directory Structure

#### Frontend (`/src/app/`)
- Route groups using Next.js App Router:
  - `(home)` - Main homepage and article feed
  - `(dashboard-editor)` - Protected dashboard routes
  - `[username]` - User profile pages
  - `[username]/[articleHandle]` - Individual article pages
- API routes in `/api/` for OAuth and development

#### Backend (`/src/backend/`)
- **Domain Models** (`/domain/`) - Core business logic entities
- **Persistence** (`/persistence/`) - Database schemas and repositories
- **Services** (`/services/`) - Business logic actions
- **Input Validation** - Zod schemas for type-safe inputs

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
- **Server State**: Drizzle ORM with PostgreSQL
- **Client State**: Jotai for global state management
- **Form State**: React Hook Form with Zod validation
- **Environment**: Type-safe environment variables with @t3-oss/env-nextjs

## Required Environment Variables

Server-side:
- `DATABASE_URL` - PostgreSQL connection string
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `GITHUB_CALLBACK_URL` - OAuth callback URL
- `CLOUDINARY_URL` - Cloudinary configuration
- `MEILISEARCH_ADMIN_API_KEY` - MeilSearch admin API key

Client-side:
- `NEXT_PUBLIC_MEILISEARCH_API_HOST` - MeilSearch API host URL
- `NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY` - MeilSearch search API key

## Key Features Implementation

### Authentication Flow
- GitHub OAuth integration via `/api/auth/github`
- User sessions managed in `userSessionsTable`
- Social provider connections in `userSocialsTable`

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

## Development Workflow

1. Database changes require running `npm run db:generate` followed by `npm run db:push`
2. Backend logic testing can be done via `npm run play` playground script
3. Type safety is enforced through Zod schemas for all inputs
4. UI components follow shadcn/ui patterns and conventions
5. All forms use React Hook Form with Zod validation schemas

## Special Considerations

- **Bengali Language Support**: Custom font loading (Kohinoor Bangla) and i18n
- **SEO Optimization**: Dynamic sitemaps, Open Graph tags, and schema markup
- **Performance**: Next.js Image optimization, bundle splitting, and caching
- **Security**: Input validation via Zod, secure OAuth flow, environment variable validation