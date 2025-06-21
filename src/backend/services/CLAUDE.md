## Action Development Conventions

When creating or modifying actions in `/src/backend/services/`, follow these conventions:

### File Structure
- **Action Files**: Use `.action.ts` suffix (e.g., `article.actions.ts`, `user.action.ts`)
- **Input Files**: Create corresponding input validation files in `/inputs/` directory (e.g., `article.input.ts`)
- **Service Files**: Use `.service.ts` suffix for utility/helper services (e.g., `search.service.ts`)

### Action Function Patterns

#### 1. Function Signature
```typescript
export async function actionName(
  _input: z.infer<typeof InputSchema.specificInput>
): Promise<ActionResponse<ReturnType>> {
  // Implementation
}
```

#### 2. Standard Action Structure
```typescript
export async function createResource(_input: z.infer<typeof Input.createInput>) {
  try {
    // 1. Authentication check (if required)
    const sessionUserId = await authID();
    if (!sessionUserId) {
      throw new ActionException("Unauthorized");
    }

    // 2. Input validation
    const input = await Input.createInput.parseAsync(_input);

    // 3. Business logic
    const result = await persistenceRepository.resource.insert([{
      // mapped fields
    }]);

    // 4. Return success response
    return {
      success: true,
      data: result
    };
  } catch (error) {
    // 5. Error handling
    return handleActionException(error);
  }
}
```

### Input Validation Conventions

#### 1. Input Schema Structure
```typescript
// In /inputs/resource.input.ts
export const ResourceInput = {
  createInput: z.object({
    required_field: z.string(),
    optional_field: z.string().optional(),
    nullable_field: z.string().optional().nullable(),
  }),
  
  updateInput: z.object({
    id: z.string(), // Always required for updates
    field: z.string().optional(),
  }),
  
  listInput: z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
  }),
};
```

#### 2. Common Input Patterns
- **IDs**: Always use `z.string()` for database IDs
- **Pagination**: Use `page` and `limit` with defaults (page: 1, limit: 10)
- **Optional Fields**: Use `.optional()` for truly optional fields
- **Nullable Fields**: Use `.optional().nullable()` for fields that can be null
- **Enums**: Use `z.enum()` for predefined values
- **Nested Objects**: Group related fields in objects (e.g., `cover_image`, `metadata`)

### Authentication Patterns

#### 1. Protected Actions
```typescript
// Always check authentication first
const sessionUserId = await authID();
if (!sessionUserId) {
  throw new ActionException("Unauthorized");
}
```

#### 2. Resource Ownership
```typescript
// Verify user owns the resource
const resource = await persistenceRepository.resource.findFirst({
  where: and(
    eq(resourceTable.id, input.id),
    eq(resourceTable.author_id, sessionUserId)
  )
});

if (!resource) {
  throw new ActionException("Resource not found or access denied");
}
```

### Error Handling Conventions

#### 1. Use ActionException for Business Logic Errors
```typescript
if (!validCondition) {
  throw new ActionException("Descriptive error message");
}
```

#### 2. Always Use handleActionException
```typescript
try {
  // Action logic
} catch (error) {
  return handleActionException(error);
}
```

#### 3. Common Error Messages
- `"Unauthorized"` - For authentication failures
- `"Resource not found"` - For missing resources
- `"Access denied"` - For authorization failures
- `"Invalid input"` - For validation errors

### Database Operation Patterns

#### 1. Insert Operations
```typescript
const result = await persistenceRepository.table.insert([{
  // Always use array, even for single inserts
  field1: value1,
  field2: value2,
}]);
```

#### 2. Update Operations
```typescript
const result = await persistenceRepository.table.update(
  { field: newValue },
  and(
    eq(table.id, id),
    eq(table.author_id, sessionUserId) // Always check ownership
  )
);
```

#### 3. Query Operations
```typescript
const result = await persistenceRepository.table.findMany({
  where: and(
    eq(table.author_id, sessionUserId),
    // Additional conditions
  ),
  orderBy: desc(table.created_at),
  limit: input.limit,
  offset: (input.page - 1) * input.limit,
});
```

### Naming Conventions

#### 1. Action Names
- **Create**: `createResource`, `createMyResource`
- **Read**: `getResource`, `getMyResources`, `findResourcesByAuthor`
- **Update**: `updateResource`, `updateMyResource`
- **Delete**: `deleteResource`, `deleteMyResource`

#### 2. Input Schema Names
- Use descriptive names: `createArticleInput`, `updateMyArticleInput`
- Group related inputs in objects: `ArticleInput.create`, `ArticleInput.update`

#### 3. File Names
- Actions: `resource.actions.ts` (plural)
- Inputs: `resource.input.ts` (singular)
- Services: `resource.service.ts` (singular)

### Return Type Conventions

#### 1. Always Use ActionResponse
```typescript
Promise<ActionResponse<YourDataType>>
```

#### 2. Success Response
```typescript
return {
  success: true,
  data: result
};
```

#### 3. Error Response (handled by handleActionException)
```typescript
return {
  success: false,
  error: "Error message"
};
```

### Business Logic Patterns

#### 1. Slug Generation
```typescript
const handle = await getUniqueArticleHandle(input.title);
```

#### 2. Relationship Management
```typescript
// Sync related entities after main operation
await syncTagsWithArticles(article.id, input.tag_ids);
```

#### 3. Cleanup Operations
```typescript
// Use utility functions for data cleanup
const cleanedData = removeNullOrUndefinedFromObject(input);
```