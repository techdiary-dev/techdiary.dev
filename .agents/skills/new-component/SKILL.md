---
name: new-component
description: Scaffold a typed React client component with props interface, Tailwind styling, and shadcn/ui primitives
---

Create a new React component for techdiary.dev.

## Rules

- Add `"use client"` only if the component uses hooks, browser APIs, or event handlers
- Always define a `Props` interface (never use `any` or inline types in the function signature)
- Use `React.FC<Props>` for the component type
- Use Tailwind CSS for all styling — no inline styles
- Use `cn()` from `@/lib/utils` for conditional class names (not `clsx` directly)
- Use shadcn/ui primitives from `@/components/ui/` where applicable
- Do not add prop validation beyond TypeScript — no PropTypes
- Keep components focused: if it needs its own data fetching, use a TanStack Query hook inside it

## Server Component Template (no hooks)

```tsx
interface Props {
  // props
}

export const <Name>: React.FC<Props> = ({ /* props */ }) => {
  return (
    <div className="">
      {/* content */}
    </div>
  );
};
```

## Client Component Template (with hooks/events)

```tsx
"use client";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  // other props
}

export const <Name>: React.FC<Props> = ({ className, /* props */ }) => {
  return (
    <div className={cn("", className)}>
      {/* content */}
    </div>
  );
};
```

## Render Props Component Template (headless/compound)

```tsx
"use client";

interface RenderProps {
  // data exposed to render
}

interface Props {
  // config
  render: (props: RenderProps) => React.ReactNode;
}

export const <Name>: React.FC<Props> = ({ render, /* config */ }) => {
  // logic here

  return <>{render({ /* render props */ })}</>;
};
```

## Component with Data Fetching

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import * as <domain>Actions from "@/backend/services/<domain>.action";

interface Props {
  id: string;
}

export const <Name>: React.FC<Props> = ({ id }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["<resource>", id],
    queryFn: () => <domain>Actions.<action>({ id }),
    enabled: Boolean(id),
  });

  if (isLoading) return <div>Loading...</div>;

  return <div>{/* render data */}</div>;
};
```

## Steps

1. Ask for the component name, where it lives, and whether it's a server or client component.
2. Ask what props it needs and what UI it renders.
3. Ask if it needs data fetching (suggest `/new-query` if yes).
4. Generate the component file.
