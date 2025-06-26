# ResourceReactionable Component

A render-prop component that provides reaction functionality for articles and comments with optimistic updates and authentication handling.

## Location
`src/components/render-props/ResourceReactionable.tsx`

## Overview
ResourceReactionable is a render-prop component that encapsulates all the logic for handling emoji reactions on resources (articles or comments). It provides data fetching, optimistic updates, authentication checking, and error handling while allowing complete flexibility in how the UI is rendered.

## Props

```typescript
interface Props {
  resource_type: "ARTICLE" | "COMMENT";
  resource_id: string;
  render: ({
    toggle,
    reactions,
    getReaction,
  }: {
    toggle: (reaction_type: REACTION_TYPE) => void;
    getReaction: (reaction_type: REACTION_TYPE) => ReactionStatusModel;
    reactions: ReactionStatusModel[];
  }) => React.ReactNode;
}
```

### Props Details
- `resource_type`: Type of resource being reacted to ("ARTICLE" or "COMMENT")
- `resource_id`: Unique identifier of the resource
- `render`: Function that receives reaction data and handlers, returns JSX

## Render Function Parameters

### Provided Data and Functions
```typescript
{
  toggle: (reaction_type: REACTION_TYPE) => void;
  getReaction: (reaction_type: REACTION_TYPE) => ReactionStatusModel;
  reactions: ReactionStatusModel[];
}
```

### ReactionStatusModel Interface
```typescript
interface ReactionStatusModel {
  reaction_type: REACTION_TYPE;
  count: number;
  is_reacted: boolean;
}
```

### REACTION_TYPE Enum
- `LOVE`: Heart emoji reaction
- `FIRE`: Fire emoji reaction
- `WOW`: Wow emoji reaction
- `HAHA`: Laugh emoji reaction
- `CRY`: Cry emoji reaction
- `UNICORN`: Unicorn emoji reaction

## Usage Examples

### Basic Usage with Custom UI
```typescript
import { ResourceReactionable } from '@/components/render-props/ResourceReactionable';

function CustomReactionButton({ articleId }) {
  return (
    <ResourceReactionable
      resource_type="ARTICLE"
      resource_id={articleId}
      render={({ reactions, toggle }) => (
        <div className="flex gap-2">
          {reactions
            .filter(r => r.count > 0)
            .map(reaction => (
              <button
                key={reaction.reaction_type}
                onClick={() => toggle(reaction.reaction_type)}
                className={`px-2 py-1 rounded ${
                  reaction.is_reacted ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                {reaction.reaction_type} {reaction.count}
              </button>
            ))}
        </div>
      )}
    />
  );
}
```

### Advanced Usage with Emoji Icons
```typescript
function EmojiReactionBar({ commentId }) {
  const emojiMap = {
    LOVE: '❤️',
    FIRE: '🔥',
    WOW: '😲',
    HAHA: '😂',
    CRY: '😢',
    UNICORN: '🦄'
  };

  return (
    <ResourceReactionable
      resource_type="COMMENT"
      resource_id={commentId}
      render={({ reactions, toggle, getReaction }) => (
        <div className="reaction-bar">
          {/* Active reactions */}
          <div className="active-reactions flex gap-1">
            {reactions
              .filter(r => r.count > 0)
              .map(reaction => (
                <button
                  key={reaction.reaction_type}
                  onClick={() => toggle(reaction.reaction_type)}
                  className={`reaction-btn ${
                    reaction.is_reacted ? 'reacted' : ''
                  }`}
                >
                  <span>{emojiMap[reaction.reaction_type]}</span>
                  <span className="count">{reaction.count}</span>
                </button>
              ))}
          </div>

          {/* Reaction picker */}
          <div className="reaction-picker">
            {Object.entries(emojiMap).map(([type, emoji]) => {
              const reactionData = getReaction(type as REACTION_TYPE);
              return (
                <button
                  key={type}
                  onClick={() => toggle(type as REACTION_TYPE)}
                  className={`picker-btn ${
                    reactionData?.is_reacted ? 'selected' : ''
                  }`}
                  title={`React with ${type.toLowerCase()}`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>
      )}
    />
  );
}
```

### Integration with Existing Components
```typescript
// How ResourceReaction component uses ResourceReactionable
function ResourceReaction({ resource_type, resource_id }) {
  return (
    <ResourceReactionable
      resource_type={resource_type}
      resource_id={resource_id}
      render={({ reactions, toggle }) => (
        <div className="flex gap-2">
          {reactions
            .filter(r => r.count)
            .map(reaction => (
              <button
                key={reaction.reaction_type}
                onClick={() => toggle(reaction.reaction_type)}
                className={`p-1 w-10 h-6 flex items-center gap-1 ${
                  reaction.is_reacted ? "bg-primary/20" : ""
                }`}
              >
                <img
                  src={`/reactions/${reaction.reaction_type}.svg`}
                  alt={`reaction-${resource_id}-${reaction.reaction_type}`}
                  className="flex-none size-4"
                />
                <span>{reaction.count}</span>
              </button>
            ))}
          
          {/* Reaction picker hover card */}
          <HoverCard openDelay={0}>
            <HoverCardTrigger asChild>
              <button className="add-reaction-btn">
                <FaceIcon />
              </button>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="flex items-center gap-2 flex-wrap">
                {reactions.map(reaction => (
                  <button
                    onClick={() => toggle(reaction.reaction_type)}
                    key={reaction.reaction_type}
                    className={`reaction-picker ${
                      reaction.is_reacted ? "bg-primary/20" : ""
                    }`}
                  >
                    <img
                      src={`/reactions/${reaction.reaction_type}.svg`}
                      className="size-5"
                    />
                  </button>
                ))}
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      )}
    />
  );
}
```

## Key Features

### Data Management
- **React Query Integration**: Automatic caching and background updates
- **Optimistic Updates**: Immediate UI feedback before server confirmation
- **Error Handling**: Automatic rollback on failure
- **Authentication**: Automatic login prompt for unauthenticated users

### State Management
```typescript
// Query for fetching reaction data
const query = useQuery({
  queryKey: ["reaction", resource_id, resource_type],
  queryFn: () => reactionActions.getResourceReactions({ resource_id, resource_type }),
});

// Mutation for toggling reactions
const mutation = useMutation({
  mutationFn: (reaction_type: REACTION_TYPE) =>
    reactionActions.toogleReaction({ resource_id, resource_type, reaction_type }),
  // Optimistic updates and error handling
});
```

### Optimistic Updates Implementation
```typescript
async onMutate(reaction_type) {
  // Cancel outgoing requests
  await queryClient.cancelQueries({
    queryKey: ["reaction", resource_id, resource_type],
  });

  // Save current state for rollback
  const oldReactions = queryClient.getQueryData([
    "reaction", resource_id, resource_type,
  ]);

  // Optimistically update the cache
  queryClient.setQueryData(
    ["reaction", resource_id, resource_type],
    (old: ReactionStatusModel[]) => {
      const index = old.findIndex((r) => r.reaction_type == reaction_type);
      if (old[index].is_reacted) {
        old[index].is_reacted = false;
        --old[index].count;
      } else {
        old[index].is_reacted = true;
        ++old[index].count;
      }
      return old;
    }
  );

  return { oldReactions };
}
```

### Authentication Integration
```typescript
async onMutate(reaction_type) {
  if (!session?.user) {
    return appLoginPopup.show(); // Show login popup for unauthenticated users
  }
  // Continue with reaction logic
}
```

## Provided Functions

### toggle(reaction_type)
```typescript
const toggle = (reaction_type: REACTION_TYPE) => {
  mutation.mutate(reaction_type);
};
```
- Toggles a specific reaction on/off
- Handles authentication automatically
- Provides optimistic updates
- Shows login popup if user not authenticated

### getReaction(reaction_type)
```typescript
const getReaction = (reaction_type: REACTION_TYPE) => {
  return query?.data?.find((r) => r.reaction_type === reaction_type);
};
```
- Retrieves specific reaction data
- Returns reaction status including count and user's reaction state
- Useful for conditional rendering based on specific reactions

## Error Handling

### Automatic Rollback
```typescript
onError: (_, __, context) => {
  // Rollback optimistic update on error
  queryClient.setQueryData(
    ["reaction", resource_id, resource_type],
    context?.oldReactions
  );
}
```

### Network Error Recovery
```typescript
onSettled: () => {
  // Refetch to ensure consistency
  queryClient.invalidateQueries({
    queryKey: ["reaction", resource_id, resource_type],
  });
}
```

## Performance Optimizations

### Query Key Strategy
```typescript
queryKey: ["reaction", resource_id, resource_type]
```
- Efficient caching per resource
- Automatic cache invalidation
- Background refetching

### Optimistic Updates
- Immediate UI feedback
- Reduced perceived latency
- Automatic rollback on failure
- Consistent state management

## Common Patterns

### Simple Reaction Counter
```typescript
<ResourceReactionable
  resource_type="ARTICLE"
  resource_id={articleId}
  render={({ reactions }) => (
    <span>
      {reactions.reduce((total, r) => total + r.count, 0)} reactions
    </span>
  )}
/>
```

### Conditional Reaction Display
```typescript
<ResourceReactionable
  resource_type="COMMENT"
  resource_id={commentId}
  render={({ reactions, toggle, getReaction }) => {
    const loveReaction = getReaction('LOVE');
    return (
      <div>
        {loveReaction?.count > 0 && (
          <span>{loveReaction.count} loves</span>
        )}
        <button onClick={() => toggle('LOVE')}>
          {loveReaction?.is_reacted ? 'Unlike' : 'Love'}
        </button>
      </div>
    );
  }}
/>
```

### Custom Reaction UI
```typescript
<ResourceReactionable
  resource_type="ARTICLE"
  resource_id={articleId}
  render={({ reactions, toggle }) => (
    <div className="custom-reactions">
      {reactions.map(reaction => (
        <div key={reaction.reaction_type} className="reaction-item">
          <button
            onClick={() => toggle(reaction.reaction_type)}
            className={`reaction-btn ${
              reaction.is_reacted ? 'user-reacted' : ''
            }`}
          >
            <ReactionIcon type={reaction.reaction_type} />
            <span className="count">{reaction.count}</span>
          </button>
        </div>
      ))}
    </div>
  )}
/>
```

## Integration with Authentication

### Login Flow
1. User clicks reaction button
2. Component checks authentication status
3. If not logged in, shows login popup
4. After login, user can proceed with reaction
5. Reaction is processed and UI updates

### Session Management
```typescript
const session = useSession();
const appLoginPopup = useLoginPopup();

// In mutation onMutate
if (!session?.user) {
  return appLoginPopup.show();
}
```

## Best Practices

### Render Function Optimization
```typescript
// Memoize expensive computations
const MemoizedReactionUI = React.memo(({ reactions, toggle }) => {
  const totalReactions = useMemo(() => 
    reactions.reduce((sum, r) => sum + r.count, 0), 
    [reactions]
  );
  
  return (
    <div>
      <span>Total: {totalReactions}</span>
      {/* Reaction buttons */}
    </div>
  );
});

<ResourceReactionable
  resource_type="ARTICLE"
  resource_id={articleId}
  render={({ reactions, toggle }) => (
    <MemoizedReactionUI reactions={reactions} toggle={toggle} />
  )}
/>
```

### Error Handling
```typescript
<ResourceReactionable
  resource_type="ARTICLE"
  resource_id={articleId}
  render={({ reactions, toggle }) => {
    if (!reactions) {
      return <div>Loading reactions...</div>;
    }
    
    return (
      <div>
        {/* Reaction UI */}
      </div>
    );
  }}
/>
```

### Accessibility
```typescript
<ResourceReactionable
  resource_type="ARTICLE"
  resource_id={articleId}
  render={({ reactions, toggle }) => (
    <div role="group" aria-label="Article reactions">
      {reactions.map(reaction => (
        <button
          key={reaction.reaction_type}
          onClick={() => toggle(reaction.reaction_type)}
          aria-label={`${reaction.is_reacted ? 'Remove' : 'Add'} ${
            reaction.reaction_type.toLowerCase()
          } reaction. Current count: ${reaction.count}`}
          aria-pressed={reaction.is_reacted}
        >
          {/* Reaction UI */}
        </button>
      ))}
    </div>
  )}
/>
```

## Related Components

- **ResourceReaction**: Pre-built UI component using ResourceReactionable
- **useLoginPopup**: Authentication popup integration
- **useSession**: User session management

## Dependencies

- **React Query**: Data fetching and caching
- **Jotai**: Session state management
- **Backend Services**: Reaction API actions