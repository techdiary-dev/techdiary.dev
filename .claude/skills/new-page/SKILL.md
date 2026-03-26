---
name: new-page
description: Scaffold a Next.js App Router page with optional server-side session check, metadata, and layout
---

Create a new Next.js App Router page for techdiary.dev.

## Rules

- Pages are Server Components by default — do NOT add `"use client"` unless the page itself needs interactivity
- Push client interactivity into child `_components/` — keep the page file lean
- Use `getSession()` from `src/backend/services/session.actions` for auth checks
- Redirect unauthenticated users with `redirect("/")` from `next/navigation`
- Export `generateMetadata` for SEO when the page has dynamic content
- Dynamic route params are passed as `params: Promise<{ slug: string }>` — always `await` them
- Place page-specific components in a `_components/` subdirectory next to `page.tsx`
- Protected pages live under `src/app/(dashboard-editor)/dashboard/`
- Public pages live under `src/app/(home)/` or `src/app/[username]/`

## Public Page Template

```tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "<Page Title> | Techdiary",
  description: "<description>",
};

export default async function <Name>Page() {
  return (
    <main>
      {/* page content */}
    </main>
  );
}
```

## Protected Page Template

```tsx
import { redirect } from "next/navigation";
import { getSession } from "@/backend/services/session.actions";

export default async function <Name>Page() {
  const { user } = await getSession();
  if (!user) redirect("/");

  return (
    <main>
      {/* page content */}
    </main>
  );
}
```

## Dynamic Route Page Template

```tsx
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `${slug} | Techdiary` };
}

export default async function <Name>Page({ params }: Props) {
  const { slug } = await params;

  return (
    <main>
      {/* use slug */}
    </main>
  );
}
```

## Steps

1. Ask for the route path and whether it's protected, public, or dynamic.
2. Ask if it needs metadata (SEO).
3. Ask what server-side data it needs to fetch on load.
4. Create `page.tsx` and stub out any `_components/` needed.
