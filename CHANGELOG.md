# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/).

---

## v1.5.0 — 2026-04-01

### ✨ Features
- feat: enhance NavbarActions with dropdown menu for creating new entries (eb652b2)
- feat: add unpublished article notice and draft byline support (4528d1a)
- feat: enhance profile page with additional user information and improved article loading states (2458ad7)
- feat: improve user profile experience with enhanced data display and loading states (3dedc30)
- feat: enhance user profile with additional fields and improved loading states (2db6598)
- feat: improve user avatar handling and display in LatestUsers component (ea1fe57)

### 🔧 Other Changes
- refactor: update theme handling and improve layout structure (524ebc4)

---

## v1.4.0 — 2026-03-30

### ✨ Features
- feat: extend resource type support to include GIST across comments and reactions (e4e6a86)
- feat: enhance CommentSection with loading states and improved layout (eaf6639)
- feat: implement resolveArticleExcerpt utility for improved excerpt handling (bccf312)

### 🐛 Bug Fixes
- fix: enhance comment functionality with update and delete actions (c80f529)

### 🔧 Other Changes
- refactor: improve comment item layout and transition effects (9268b61)
- refactor: adjust layout and styling in ArticleCard and UserInformationCard components (a9caafc)

---

## v1.3.0 — 2026-03-30

### ✨ Features
- feat: add footer with attribution to techdiary.dev in GistCodeImageDialog (b7c15b9)
- feat: add clipboard copy functionality to GistCodeImageDialog (01831a8)
- feat: add image export functionality to GistViewer (f9c31ba)

### 🐛 Bug Fixes
- fix: improve error handling in bookmark and reaction services (6199497)

### 🔧 Other Changes
- refactor: streamline Gist retrieval logic and enhance error handling (062cac5)
- refactor: enhance bookmarks handling and improve state management (6368aaa)
- docs: update CLAUDE.md to reflect authentication and Gist enhancements (14c7236)

---

## v1.2.0 — 2026-03-30

### ✨ Features
- feat: add Gists navigation links to HomeLeftSidebar and AuthenticatedUserMenu (753074b)

---

## v1.1.0 — 2026-03-29

### ✨ Features
- feat: enhance GistViewer with improved code and markdown rendering (81551e0)
- feat: enhance Gist functionality and navigation (9bd333c)
- feat: enable Partial Prerendering and ISR via cacheComponents (ecf3a6f)
- feat: configure Next.js for standalone output (de04b18)
- feat: enhance HomeLeftSidebar with dynamic tag fetching and user session handling (dde7f7a)
- feat: improve SEO across metadata, sitemaps, and structured data (e8a0f0b)
- feat: integrate WorkOS authentication and update user model to include auth_id (90ab3c6)
- feat: make article title optional and generate unique untitled-{random} fallback (cd33107)
- feat: add LivecodeTag component for interactive code examples and integrate Sandpack support (508a013)
- feat: add gallery image support in ArticleCard and extract image URLs from markdown (eb01f71)

### 🐛 Bug Fixes
- fix: handle edge case for bookmark status retrieval when user is authenticated (40b26f3)
- fix: return bookmarked false for unauthenticated users in bookmarkStatus (6b3068f)
- fix: update link text in ProfileNavigation from "My articles" to "Articles" (7b47c3e)
- fix: limit gallery images to a maximum of 4 in ArticleFeed component (a1db74c)
- fix: update avatar placeholder URL to use initials instead of personas (7cb7210)
- fix: update avatar utility function for consistency (f70e1bb)

### 🔧 Other Changes
- refactor: remove next.config.mjs and update file path handling in opengraph-image.tsx (5be4650)
- chore: update dependencies and improve TypeScript configuration (517e709)
- chore: update next dependency to ^16.1.6 (5051235)
- refactor: update authentication links and streamline logout process in Navbar (56926e9)
- chore: update zod to 3.25.0 and refactor imports to zod/v4 (434d72e)
- refactor: replace AlertDialog with Dialog component (25a5804 / c0f89c0)
