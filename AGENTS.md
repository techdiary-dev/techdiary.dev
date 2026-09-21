@CLAUDE.md

# Coding Patterns

Follow these when adding code. Load the matching skill in `.agents/skills/` for the full template.

Order for a new feature:

1. Domain model + Drizzle schema + SQLKit repository (if a new entity)
2. Zod input in `src/backend/services/inputs/`
3. Server action in `src/backend/services/`
4. Page / component
5. TanStack Query (and React Hook Form if it submits)

Do not invent API routes for app data. Call server actions from TanStack Query. All DB access goes through `persistenceRepository` (SQLKit). Drizzle is migrations only.

---

## Component (`.agents/skills/new-component`)

- `"use client"` only when the file uses hooks, browser APIs, or event handlers.
- Define a `Props` interface. Type the component as `React.FC<Props>`.
- Tailwind only. Conditional classes via `cn()` from `@/lib/utils`, not `clsx` directly.
- Prefer shadcn/ui from `@/components/ui/`.
- Fetch inside the component with TanStack Query — never `useEffect` + fetch, never call a server action from an event handler except through `useMutation`.
- Page-specific UI lives in `_components/` next to `page.tsx`.

```tsx
"use client";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export const Example: React.FC<Props> = ({ className }) => {
  return <div className={cn("", className)}>{/* … */}</div>;
};
```

---

## Page (`.agents/skills/new-page`)

- Pages are Server Components. Keep `page.tsx` lean; put interactivity in child `_components/`.
- Protected pages: `getSession()` then `redirect("/")` if no user. Live under `src/app/(dashboard-editor)/dashboard/`.
- Public pages live under `src/app/(home)/` or `src/app/[username]/`.
- Dynamic `params` are `Promise<{ … }>` — always `await` them.
- Export `generateMetadata` (or `metadata`) for SEO.
- Do not add `"use client"` to the page file unless the page itself is interactive.

---

## Input (`.agents/skills/new-input`)

- One file per domain: `src/backend/services/inputs/<domain>.input.ts`.
- Export a single `const <Domain>Input = { … }` with every schema for that domain.
- Actions always `parseAsync()` — never `parse()`.
- IDs are `z.string()`. Pagination always has `page: z.number().default(1)` and `limit: z.number().default(10)`.
- Normalize empty strings with `.transform()` (e.g. `""` → `null`).
- Reuse these schemas in forms. Do not duplicate Zod definitions on the client.

---

## Action (`.agents/skills/new-action`)

- File: `src/backend/services/<domain>.action.ts` (or `.actions.ts`). First line: `"use server"`.
- Return `Promise<ActionResponse<T>>`. Check `response.success` before using `response.data`.
- Validate with the domain Zod schema, then `authID()` for protected work, then `persistenceRepository`.
- Throw `ActionException` for auth/domain failures. Catch everything with `handleActionException(error)`.
- Do not add `'use cache'` to mutations (`createX` / `updateX` / `deleteX`) or to functions that read `cookies()` / `headers()`.

```ts
"use server";

export async function updateThing(
  _input: z.infer<typeof ThingInput.updateThingInput>,
): Promise<ActionResponse<Thing>> {
  try {
    const input = await ThingInput.updateThingInput.parseAsync(_input);

    const userId = await authID();
    if (!userId) throw new ActionException("Unauthorized");

    const [result] = await persistenceRepository.thing.update({
      data: input,
      where: and(eq("id", input.thing_id), eq("author_id", userId)),
    });

    return { success: true, data: result };
  } catch (error) {
    return handleActionException(error);
  }
}
```

---

## Query (`.agents/skills/new-query`)

Call server actions directly from `queryFn` / `mutationFn`. No REST wrappers.

- Query keys are arrays: `["resource"]`, `["resource", id]`, `["resource", id, type]`.
- `enabled: Boolean(id)` when the query depends on a value.
- `refetchOnWindowFocus: false` is already global — do not repeat it.
- Toast with `toast()` from `sonner`.
- `useQueryClient()` only for invalidation or optimistic updates.

```ts
const query = useQuery({
  queryKey: ["resource", id],
  queryFn: () => domainActions.getThing({ id }),
  enabled: Boolean(id),
});

const mutation = useMutation({
  mutationFn: (payload: Payload) => domainActions.updateThing(payload),
  onSuccess: () => {
    toast("Saved");
    queryClient.invalidateQueries({ queryKey: ["resource"] });
  },
  onError: (error) => {
    toast.error(error.message ?? "Something went wrong");
  },
});
```

Paginated lists use `useInfiniteQuery`. `getNextPageParam` reads `lastPage?.meta.hasNextPage`. Flatten with `pages.flatMap((p) => p?.nodes)`.

Optimistic updates: `cancelQueries` → snapshot → `setQueryData` → rollback in `onError` → `invalidateQueries` in `onSettled`. See `ResourceReactionable.tsx`.

---

## Form (`.agents/skills/new-form`)

- Always `"use client"`. React Hook Form + `zodResolver` + the backend Zod schema.
- Submit through `useMutation`, never by calling the action in `onSubmit` directly.
- `SubmitHandler<z.infer<typeof Schema>>`. Default values through `filterUndefined()`.
- shadcn Form primitives: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`.
- Toast on success and error. Disable the submit button while `mutation.isPending`.

---

## Repository (`.agents/skills/new-repository`)

New entity = four files, in this order:

1. `src/backend/persistence/schemas.ts` — Drizzle `pgTable` (migrations only)
2. `src/backend/persistence/persistence-contracts.ts` — `DatabaseTableName` enum
3. `src/backend/models/domain-models.ts` — TypeScript interface
4. `src/backend/persistence/persistence-repositories.ts` — `new Repository<Model>(…)` on `persistenceRepository`

Then `bun run db:generate` and `bun run db:push`. Complex joins: `pgClient.executeSQL()`, not ad-hoc query builders.

---

## Caching

Public, cookie-free reads may use `'use cache'` + `cacheLife()` + `cacheTag()`. Bust with `revalidateTag()` after mutations. Session, dashboard, and anything that calls `cookies()` / `headers()` stays dynamic and wrapped in `<Suspense>`. Never `export const revalidate = N`.

<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->
