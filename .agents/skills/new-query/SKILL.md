---
name: new-query
description: Scaffold TanStack Query useQuery and/or useMutation hooks for a feature, calling a backend server action
---

Create TanStack Query hooks for a feature component in techdiary.dev.

## Rules

- Always import server actions directly — no API routes needed
- QueryKey must be an array: `["<resource>", param1, param2]`
- Use `enabled` option when the query depends on a condition (e.g. `Boolean(resource_id)`)
- Set `refetchOnWindowFocus: false` is already the global default — don't repeat it
- For optimistic updates: cancel queries → snapshot old data → update cache → return snapshot → rollback on error → invalidate on settled
- Use `useQueryClient()` only when you need optimistic updates or manual invalidation
- Toast on success using the `toast()` from `sonner`

## useQuery Template

```ts
"use client";

import { useQuery } from "@tanstack/react-query";
import * as <domain>Actions from "@/backend/services/<domain>.action";

const <resource>Query = useQuery({
  queryKey: ["<resource>", param],
  queryFn: () => <domain>Actions.<actionName>({ param }),
  enabled: Boolean(param),
});

// Access: <resource>Query.data, <resource>Query.isLoading, <resource>Query.error
```

## useMutation Template

```ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as <domain>Actions from "@/backend/services/<domain>.action";

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (payload: <PayloadType>) => <domain>Actions.<actionName>(payload),
  onSuccess: () => {
    toast("Success message");
    queryClient.invalidateQueries({ queryKey: ["<resource>"] });
  },
  onError: (error) => {
    toast.error(error.message ?? "Something went wrong");
  },
});
```

## Optimistic Update Template

```ts
const mutation = useMutation({
  mutationFn: (payload) => <domain>Actions.<actionName>(payload),

  async onMutate(payload) {
    await queryClient.cancelQueries({ queryKey: ["<resource>", id] });
    const previous = queryClient.getQueryData(["<resource>", id]);

    queryClient.setQueryData(["<resource>", id], (old: <Type>) => ({
      ...old,
      // apply optimistic change
    }));

    return { previous };
  },

  onError: (_err, _payload, context) => {
    queryClient.setQueryData(["<resource>", id], context?.previous);
  },

  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["<resource>", id] });
  },
});
```

## Infinite Query Template

```ts
const feedQuery = useInfiniteQuery({
  queryKey: ["<resource>-feed", filter],
  queryFn: ({ pageParam }) =>
    <domain>Actions.<listAction>({ page: pageParam, limit: 10 }),
  initialPageParam: 1,
  getNextPageParam: (lastPage) =>
    lastPage?.meta.hasNextPage ? lastPage.meta.currentPage + 1 : undefined,
});

// Access: feedQuery.data?.pages.flatMap(p => p?.nodes)
```

## Steps

1. Ask what server action(s) will be called and whether read, write, or both are needed.
2. Ask if optimistic updates are required.
3. Ask if it's a paginated/infinite list.
4. Generate the hook(s) inline in the target component or as a custom hook file in `src/hooks/`.
