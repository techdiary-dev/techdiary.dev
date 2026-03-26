---
name: new-action
description: Scaffold a new backend server action with auth check, Zod input validation, repository call, and error handling
---

Create a new backend server action for the techdiary.dev project.

## Rules

- File goes in `src/backend/services/` named `<domain>.action.ts` or `<domain>.actions.ts`
- Always add `"use server"` at the top
- Always validate input with `parseAsync()` from a Zod schema in `src/backend/services/inputs/<domain>.input.ts`
- Always check auth with `await authID()` for protected actions
- Always wrap in try/catch and return `handleActionException(error)` in the catch
- Return type must be `Promise<ActionResponse<T>>` where T is the domain model from `src/backend/models/domain-models.ts`
- Use `persistenceRepository.<entity>` from `src/backend/persistence/persistence-repositories.ts`
- Throw `ActionException` for domain/auth errors

## Template

```ts
"use server";

import { z } from "zod";
import { authID } from "./session.actions";
import { ActionException, handleActionException } from "./RepositoryException";
import { persistenceRepository } from "../persistence/persistence-repositories";
import { ActionResponse } from "../models/action-contracts";
import { <DomainModel> } from "../models/domain-models";
import { <Domain>Input } from "./inputs/<domain>.input";

export async function <actionName>(
  _input: z.infer<typeof <Domain>Input.<actionName>Input>,
): Promise<ActionResponse<<DomainModel>>> {
  try {
    const input = await <Domain>Input.<actionName>Input.parseAsync(_input);

    const userId = await authID();
    if (!userId) throw new ActionException("Unauthorized");

    const [result] = await persistenceRepository.<entity>.<operation>({
      // query here
    });

    return { success: true, data: result };
  } catch (error) {
    return handleActionException(error);
  }
}
```

## Steps

1. Ask the user for: domain name, action name, whether it's auth-protected, what repository operation it performs, and the return type.
2. Check if a `src/backend/services/inputs/<domain>.input.ts` exists. If not, suggest running `/new-input` first.
3. Create or append to `src/backend/services/<domain>.action.ts`.
4. Follow the template exactly — do not add extra abstractions.
