---
name: new-input
description: Create a Zod input schema file in src/backend/services/inputs/ for a domain entity
---

Create a new Zod input schema file for a domain in `src/backend/services/inputs/`.

## Rules

- File path: `src/backend/services/inputs/<domain>.input.ts`
- Export a single `const <Domain>Input = { ... }` object containing all schemas for the domain
- Always use `parseAsync()` — never `parse()`
- Use `.optional()` and `.nullable()` explicitly where needed
- Use `.transform()` to normalize data (e.g. empty string → null)
- Pagination inputs always include `page: z.number().default(1)` and `limit: z.number().default(10)`
- ID fields are always `z.string()`
- Enum fields use `z.enum([...])` matching the domain model

## Common Patterns

```ts
import { z } from "zod";

export const <Domain>Input = {
  // Create
  create<Domain>Input: z.object({
    field: z.string().min(1),
    optional_field: z.string().optional().nullable(),
  }),

  // Update (always requires an ID)
  update<Domain>Input: z.object({
    <domain>_id: z.string(),
    field: z.string().optional(),
  }),

  // Paginated list
  list<Domain>Input: z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
  }),

  // Nested metadata with transform
  withMetaInput: z.object({
    metadata: z.object({
      canonical_url: z
        .union([z.string().url(), z.literal(""), z.null()])
        .transform((v) => (v === "" ? null : v))
        .optional(),
    }).optional().nullable(),
  }),
};
```

## Steps

1. Ask the user for the domain name and list of operations needed (create, update, delete, list, etc.).
2. For each operation, ask what fields are required vs optional.
3. Create `src/backend/services/inputs/<domain>.input.ts` with all schemas.
4. Do not split schemas into separate files — keep all schemas for a domain in one file.
