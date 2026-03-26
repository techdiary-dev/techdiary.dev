---
name: new-repository
description: Add a new SQLKit repository to persistence-repositories.ts and a corresponding Drizzle schema table to schemas.ts
---

Add a new database entity to techdiary.dev: Drizzle schema table + SQLKit repository.

## Rules

- Schema file: `src/backend/persistence/schemas.ts` (Drizzle, used for migrations only)
- Repository file: `src/backend/persistence/persistence-repositories.ts`
- Table name enum: `src/backend/persistence/persistence-contracts.ts`
- Domain model interface: `src/backend/models/domain-models.ts`
- Always run `bun run db:generate` then `bun run db:push` after schema changes
- Use `pgTable` from `drizzle-orm/pg-core` for the schema definition
- Repository is `new Repository<DomainModel>(DatabaseTableName.<entity>, pgClient)`
- Add the new repository to the `persistenceRepository` export object

## Step 1 — Add to `schemas.ts`

```ts
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const <entity>Table = pgTable("<table_name>", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  // fields here
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
```

## Step 2 — Add to `persistence-contracts.ts`

```ts
export enum DatabaseTableName {
  // existing entries...
  <entity> = "<table_name>",
}
```

## Step 3 — Add to `domain-models.ts`

```ts
export interface <DomainModel> {
  id: string;
  // fields matching schema
  created_at: Date;
  updated_at: Date;
}
```

## Step 4 — Add to `persistence-repositories.ts`

```ts
import { <DomainModel> } from "../models/domain-models";

const <entity>Repository = new Repository<<DomainModel>>(
  DatabaseTableName.<entity>,
  pgClient,
  { logging: false },
);

export const persistenceRepository = {
  // existing repositories...
  <entity>: <entity>Repository,
};
```

## Step 5 — Run migrations

```bash
bun run db:generate
bun run db:push
```

## Steps

1. Ask for the entity name, table name, and all fields with their types and constraints.
2. Ask which fields are nullable, have defaults, or reference other tables (foreign keys).
3. Update all four files in order (schemas → contracts → domain-models → repositories).
4. Remind the user to run migrations.
