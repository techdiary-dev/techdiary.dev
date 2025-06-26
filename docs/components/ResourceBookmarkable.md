# ResourceBookmarkable Component

A render-prop component that provides bookmark functionality for articles and comments with optimistic updates and state management.

## Location
`src/components/render-props/ResourceBookmarkable.tsx`

## Overview
ResourceBookmarkable is a render-prop component that encapsulates all the logic for handling bookmarking of resources (articles or comments). It provides data fetching, optimistic updates, state synchronization, and error handling while allowing complete flexibility in how the bookmark UI is rendered.

## Props

```typescript
interface Props {
  resource_type: "ARTICLE" | "COMMENT";
  resource_id: string;
  render: ({
    toggle,
    bookmarked,
  }: {
    toggle: () => void;
    bookmarked: boolean;
  }) => React.ReactNode;
}
```

### Props Details
- `resource_type`: Type of resource being bookmarked ("ARTICLE" or "COMMENT")
- `resource_id`: Unique identifier of the resource
- `render`: Function that receives bookmark state and toggle function, returns JSX

## Render Function Parameters

### Provided Data and Functions
```typescript
{
  toggle: () => void;
  bookmarked: boolean;
}
```

- `toggle`: Function to toggle bookmark state on/off
- `bookmarked`: Current bookmark status (true if bookmarked, false if not)

## Usage Examples

### Basic Bookmark Button
```typescript
import { ResourceBookmarkable } from '@/components/render-props/ResourceBookmarkable';

function SimpleBookmarkButton({ articleId }) {
  return (
    <ResourceBookmarkable
      resource_type="ARTICLE"
      resource_id={articleId}
      render={({ toggle, bookmarked }) => (
        <button
          onClick={toggle}
          className={`bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
        >
          {bookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
        </button>
      )}
    />
  );
}
```

### Icon-based Bookmark Toggle
```typescript
import { BookmarkIcon, BookmarkFilledIcon } from '@/components/icons';

function IconBookmarkButton({ commentId }) {
  return (
    <ResourceBookmarkable
      resource_type="COMMENT"
      resource_id={commentId}
      render={({ toggle, bookmarked }) => (
        <button
          onClick={toggle}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          {bookmarked ? (
            <BookmarkFilledIcon className="w-5 h-5 text-blue-600" />
          ) : (
            <BookmarkIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      )}
    />
  );
}
```

### Advanced Bookmark UI with Status
```typescript
function DetailedBookmarkButton({ articleId }) {
  return (
    <ResourceBookmarkable
      resource_type="ARTICLE"
      resource_id={articleId}
      render={({ toggle, bookmarked }) => (
        <div className="bookmark-container">
          <button
            onClick={toggle}
            className={`bookmark-button ${
              bookmarked 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 text-gray-700'
            } border rounded-lg px-3 py-2 flex items-center gap-2 transition-all`}
          >
            <BookmarkIcon 
              className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} 
            />
            <span className="text-sm font-medium">
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </span>
          </button>
          
          {bookmarked && (
            <p className="text-xs text-gray-500 mt-1">
              Saved to your reading list
            </p>
          )}
        </div>
      )}
    />
  );
}
```

### Integration with Article Cards
```typescript
// How ResourceBookmark component uses ResourceBookmarkable
function ResourceBookmark({ resource_type, resource_id }) {
  return (
    <ResourceBookmarkable
      resource_type={resource_type}
      resource_id={resource_id}
      render={({ toggle, bookmarked }) => (
        <button
          onClick={toggle}
          className="p-2 rounded-full hover:bg-gray-100"
          title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <BookmarkIcon 
            className={`w-5 h-5 ${
              bookmarked ? 'fill-blue-600 text-blue-600' : 'text-gray-400'
            }`}
          />
        </button>
      )}
    />
  );
}
```

### Bulk Bookmark Actions
```typescript
function BookmarkableArticleList({ articles }) {
  return (
    <div className="article-list">
      {articles.map(article => (
        <div key={article.id} className="article-item">
          <h3>{article.title}</h3>
          <p>{article.excerpt}</p>
          
          <div className="article-actions">
            <ResourceBookmarkable
              resource_type="ARTICLE"
              resource_id={article.id}
              render={({ toggle, bookmarked }) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggle}
                    className={`bookmark-action ${
                      bookmarked ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                  </button>
                  
                  {bookmarked && (
                    <span className="text-xs text-green-600">
                      ✓ Saved
                    </span>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Key Features

### State Management
- **Local State**: Uses React `useState` for immediate UI feedback
- **Server Sync**: Synchronizes with server state via React Query
- **Optimistic Updates**: Immediate UI response before server confirmation
- **Error Recovery**: Automatic state correction on server response

### Data Flow
```typescript
// Query for fetching bookmark status
const status = useQuery({
  queryKey: ["bookmark-status", resource_id],
  queryFn: () => bookmarkAction.bookmarkStatus({ resource_id, resource_type }),
  enabled: Boolean(resource_id) && Boolean(resource_type),
});

// Mutation for toggling bookmark
const mutation = useMutation({
  mutationFn: () =>
    bookmarkAction.toggleResourceBookmark({ resource_id, resource_type }),
  onSuccess: (data) => {
    setBookmarked(data?.bookmarked ?? false);
  },
});
```

### Optimistic Updates Implementation
```typescript
const toggle = () => {
  setBookmarked((state) => !state); // Immediate UI update
  mutation.mutate(); // Server update
};

// Server response reconciliation
useEffect(() => {
  if (status.data) {
    setBookmarked(status.data.bookmarked ?? false);
  }
}, [status.data]);
```

## State Synchronization

### Initial State Loading
```typescript
useEffect(() => {
  if (status.data) {
    setBookmarked(status.data.bookmarked ?? false);
  }
}, [status.data]);
```

### Server Response Handling
```typescript
onSuccess: (data) => {
  setBookmarked(data?.bookmarked ?? false);
}
```

### Query Configuration
```typescript
const status = useQuery({
  queryKey: ["bookmark-status", resource_id],
  queryFn: () => bookmarkAction.bookmarkStatus({ resource_id, resource_type }),
  enabled: Boolean(resource_id) && Boolean(resource_type), // Only fetch when props are valid
});
```

## Performance Optimizations

### Conditional Queries
- Only fetches bookmark status when resource_id and resource_type are provided
- Prevents unnecessary API calls during component mounting

### Efficient State Updates
- Local state provides immediate feedback
- Server state ensures consistency
- Minimal re-renders through proper state management

### Query Key Strategy
```typescript
queryKey: ["bookmark-status", resource_id]
```
- Efficient caching per resource
- Automatic cache invalidation
- Background refetching when needed

## Common Patterns

### Simple Toggle
```typescript
<ResourceBookmarkable
  resource_type="ARTICLE"
  resource_id={articleId}
  render={({ toggle, bookmarked }) => (
    <button onClick={toggle}>
      {bookmarked ? '💙' : '🤍'}
    </button>
  )}
/>
```

### Loading State Handling
```typescript
<ResourceBookmarkable
  resource_type="ARTICLE"
  resource_id={articleId}
  render={({ toggle, bookmarked }) => (
    <button onClick={toggle} disabled={!articleId}>
      {bookmarked ? 'Bookmarked ✓' : 'Bookmark'}
    </button>
  )}
/>
```

### Conditional Rendering
```typescript
<ResourceBookmarkable
  resource_type="COMMENT"
  resource_id={commentId}
  render={({ toggle, bookmarked }) => (
    <div>
      <button onClick={toggle}>
        {bookmarked ? 'Remove from Reading List' : 'Save for Later'}
      </button>
      
      {bookmarked && (
        <div className="bookmark-confirmation">
          <span>✓ Added to your reading list</span>
          <button onClick={() => navigate('/bookmarks')}>
            View All Bookmarks
          </button>
        </div>
      )}
    </div>
  )}
/>
```

### Custom Styling Based on State
```typescript
<ResourceBookmarkable
  resource_type="ARTICLE"
  resource_id={articleId}
  render={({ toggle, bookmarked }) => (
    <button
      onClick={toggle}
      className={`
        px-4 py-2 rounded-full border-2 transition-all duration-200
        ${bookmarked 
          ? 'bg-blue-500 border-blue-500 text-white shadow-lg' 
          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
        }
      `}
    >
      <span className="flex items-center gap-2">
        <BookmarkIcon className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
        {bookmarked ? 'Bookmarked' : 'Bookmark'}
      </span>
    </button>
  )}
/>
```

## Error Handling

### Network Errors
```typescript
// Component handles network errors gracefully
// State remains consistent even if server requests fail
// Automatic retry on next interaction
```

### Invalid Props
```typescript
// Query is disabled if resource_id or resource_type are missing
enabled: Boolean(resource_id) && Boolean(resource_type)
```

### State Inconsistency
```typescript
// Server response always wins for final state
onSuccess: (data) => {
  setBookmarked(data?.bookmarked ?? false);
}
```

## Accessibility Features

### ARIA Labels
```typescript
<ResourceBookmarkable
  resource_type="ARTICLE"
  resource_id={articleId}
  render={({ toggle, bookmarked }) => (
    <button
      onClick={toggle}
      aria-label={`${bookmarked ? 'Remove' : 'Add'} bookmark for this article`}
      aria-pressed={bookmarked}
    >
      <BookmarkIcon />
    </button>
  )}
/>
```

### Keyboard Navigation
```typescript
<ResourceBookmarkable
  resource_type="ARTICLE"
  resource_id={articleId}
  render={({ toggle, bookmarked }) => (
    <button
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      }}
      tabIndex={0}
    >
      {bookmarked ? 'Bookmarked' : 'Bookmark'}
    </button>
  )}
/>
```

### Screen Reader Support
```typescript
<ResourceBookmarkable
  resource_type="ARTICLE"
  resource_id={articleId}
  render={({ toggle, bookmarked }) => (
    <div>
      <button onClick={toggle}>
        <span aria-hidden="true">📖</span>
        <span className="sr-only">
          {bookmarked 
            ? 'Remove this article from your bookmarks' 
            : 'Add this article to your bookmarks'
          }
        </span>
      </button>
      
      <div role="status" aria-live="polite" className="sr-only">
        {bookmarked ? 'Article bookmarked' : 'Bookmark removed'}
      </div>
    </div>
  )}
/>
```

## Integration Examples

### With Authentication
```typescript
function AuthenticatedBookmark({ articleId }) {
  const { user } = useSession();
  
  if (!user) {
    return (
      <button onClick={() => showLogin()}>
        Login to Bookmark
      </button>
    );
  }
  
  return (
    <ResourceBookmarkable
      resource_type="ARTICLE"
      resource_id={articleId}
      render={({ toggle, bookmarked }) => (
        <button onClick={toggle}>
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
      )}
    />
  );
}
```

### With Toast Notifications
```typescript
function BookmarkWithFeedback({ articleId }) {
  const { showToast } = useToast();
  
  return (
    <ResourceBookmarkable
      resource_type="ARTICLE"
      resource_id={articleId}
      render={({ toggle, bookmarked }) => (
        <button
          onClick={() => {
            toggle();
            showToast(
              bookmarked 
                ? 'Bookmark removed' 
                : 'Article bookmarked!'
            );
          }}
        >
          {bookmarked ? 'Remove' : 'Bookmark'}
        </button>
      )}
    />
  );
}
```

## Best Practices

### Performance Optimization
```typescript
// Memoize expensive render functions
const BookmarkButton = React.memo(({ toggle, bookmarked }) => (
  <button onClick={toggle}>
    {bookmarked ? 'Bookmarked' : 'Bookmark'}
  </button>
));

<ResourceBookmarkable
  resource_type="ARTICLE"
  resource_id={articleId}
  render={({ toggle, bookmarked }) => (
    <BookmarkButton toggle={toggle} bookmarked={bookmarked} />
  )}
/>
```

### State Management
```typescript
// Use local state for immediate feedback
// Trust server state for consistency
// Handle loading states appropriately

<ResourceBookmarkable
  render={({ toggle, bookmarked }) => (
    <button
      onClick={toggle}
      disabled={isLoading} // If you track loading state
    >
      {isLoading ? 'Saving...' : (bookmarked ? 'Bookmarked' : 'Bookmark')}
    </button>
  )}
/>
```

### Error Boundaries
```typescript
function BookmarkWithErrorBoundary({ articleId }) {
  return (
    <ErrorBoundary fallback={<div>Bookmark unavailable</div>}>
      <ResourceBookmarkable
        resource_type="ARTICLE"
        resource_id={articleId}
        render={({ toggle, bookmarked }) => (
          <BookmarkButton toggle={toggle} bookmarked={bookmarked} />
        )}
      />
    </ErrorBoundary>
  );
}
```

## Related Components

- **ResourceBookmark**: Pre-built UI component using ResourceBookmarkable
- **BookmarkList**: Component for displaying user's bookmarked items
- **BookmarkPage**: Full page bookmark management interface

## Dependencies

- **React Query**: Data fetching and caching
- **Backend Services**: Bookmark API actions
- **React**: State management and effects