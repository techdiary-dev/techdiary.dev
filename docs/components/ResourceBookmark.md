# ResourceBookmark Component

A pre-built bookmark button component that provides a ready-to-use UI for bookmarking articles and comments.

## Location
`src/components/ResourceBookmark.tsx`

## Overview
ResourceBookmark is a UI component that uses ResourceBookmarkable under the hood to provide a consistent bookmark button interface. It includes authentication handling, visual feedback, and responsive design.

## Props

```typescript
interface ResourceBookmarkProps {
  resource_type: "ARTICLE" | "COMMENT";
  resource_id: string;
}
```

### Props Details
- `resource_type`: Type of resource being bookmarked ("ARTICLE" or "COMMENT")
- `resource_id`: Unique identifier of the resource

## Usage Examples

### Article Bookmark
```typescript
import ResourceBookmark from '@/components/ResourceBookmark';

function ArticleCard({ article }) {
  return (
    <div className="article-card">
      <h2>{article.title}</h2>
      <p>{article.excerpt}</p>
      
      <div className="article-actions">
        <ResourceBookmark 
          resource_type="ARTICLE" 
          resource_id={article.id} 
        />
      </div>
    </div>
  );
}
```

### Comment Bookmark
```typescript
function CommentItem({ comment }) {
  return (
    <div className="comment">
      <p>{comment.content}</p>
      
      <div className="comment-actions">
        <ResourceBookmark 
          resource_type="COMMENT" 
          resource_id={comment.id} 
        />
      </div>
    </div>
  );
}
```

### In Article Footer
```typescript
function ArticleFooter({ articleId }) {
  return (
    <footer className="article-footer flex items-center gap-4">
      <ResourceReaction 
        resource_type="ARTICLE" 
        resource_id={articleId} 
      />
      <ResourceBookmark 
        resource_type="ARTICLE" 
        resource_id={articleId} 
      />
      <ShareButton articleId={articleId} />
    </footer>
  );
}
```

## Features

### Visual Design
- **Bookmark Icon**: SVG bookmark icon with stroke and fill states
- **Visual Feedback**: Different appearance for bookmarked vs unbookmarked states
- **Hover Effects**: Smooth hover transitions with background highlight
- **Responsive**: Touch-friendly size and spacing

### User Interaction
- **Click to Toggle**: Single click to bookmark/unbookmark
- **Authentication Check**: Automatic login prompt for unauthenticated users
- **Immediate Feedback**: Optimistic UI updates via ResourceBookmarkable
- **State Persistence**: Bookmark state persists across sessions

### Visual States

#### Unbookmarked State
```typescript
// Stroke-only bookmark icon
className="size-5 stroke-2 fill-transparent !stroke-current"
// Light background on hover
className="hover:bg-primary/20"
```

#### Bookmarked State
```typescript
// Filled bookmark icon
className="size-5 stroke-2 !fill-current"
// Highlighted background
className="bg-primary/20"
```

## Implementation Details

### Uses ResourceBookmarkable
```typescript
<ResourceBookmarkable
  resource_type={resource_type}
  resource_id={resource_id}
  render={({ bookmarked, toggle }) => (
    // UI implementation
  )}
/>
```

### Authentication Integration
```typescript
onClick={() => {
  if (!session?.user) {
    loginPopup.show(); // Show login popup
    return;
  }
  toggle(); // Proceed with bookmark toggle
}}
```

### Styling Classes
```typescript
// Base button styles
"transition-colors duration-300 flex cursor-pointer px-2 py-1 rounded-sm hover:bg-primary/20"

// Conditional background highlight
{ "bg-primary/20": bookmarked }

// Icon conditional styling
{
  "!stroke-current": !bookmarked,
  "!fill-current": bookmarked,
}
```

## Component Structure

### Button Container
- Padding: `px-2 py-1` for comfortable click area
- Rounded corners: `rounded-sm`
- Hover effect: `hover:bg-primary/20`
- Transition: `transition-colors duration-300`

### SVG Icon
- Size: `size-5` (20px × 20px)
- Stroke width: `stroke-2`
- Conditional fill based on bookmark state
- Accessible stroke and fill properties

## Authentication Flow

1. **User clicks bookmark button**
2. **Authentication check**: Component checks if user is logged in
3. **If not authenticated**: Shows login popup via `useLoginPopup`
4. **If authenticated**: Proceeds with bookmark toggle
5. **UI updates**: Immediate visual feedback via optimistic updates
6. **Server sync**: ResourceBookmarkable handles server communication

## Accessibility Features

### Semantic HTML
- Proper `button` element for interaction
- Keyboard navigation support
- Focus management

### Visual Accessibility
- High contrast icon states
- Clear visual feedback for state changes
- Consistent sizing and spacing
- Touch-friendly interaction area

### Screen Reader Support
```typescript
// Recommended enhancement
<button
  onClick={handleClick}
  aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
  aria-pressed={bookmarked}
>
  <BookmarkIcon />
</button>
```

## Integration with Other Components

### With ArticleCard
```typescript
function ArticleCard({ article }) {
  return (
    <div className="article-card">
      <div className="article-content">
        {/* Article content */}
      </div>
      
      <div className="article-actions flex items-center justify-between">
        <ResourceReaction 
          resource_type="ARTICLE" 
          resource_id={article.id} 
        />
        <ResourceBookmark 
          resource_type="ARTICLE" 
          resource_id={article.id} 
        />
      </div>
    </div>
  );
}
```

### With Comment System
```typescript
function CommentActions({ commentId }) {
  return (
    <div className="comment-actions flex items-center gap-2">
      <ResourceReaction 
        resource_type="COMMENT" 
        resource_id={commentId} 
      />
      <ResourceBookmark 
        resource_type="COMMENT" 
        resource_id={commentId} 
      />
      <ReplyButton commentId={commentId} />
    </div>
  );
}
```

## Customization

### Custom Styling
```typescript
// Wrap with custom styles
<div className="custom-bookmark-wrapper">
  <ResourceBookmark 
    resource_type="ARTICLE" 
    resource_id={articleId} 
  />
</div>

// Override with CSS
.custom-bookmark-wrapper button {
  background: custom-bg;
  border-radius: custom-radius;
}
```

### Alternative Implementation
If you need different styling, use ResourceBookmarkable directly:

```typescript
<ResourceBookmarkable
  resource_type="ARTICLE"
  resource_id={articleId}
  render={({ bookmarked, toggle }) => (
    <button
      onClick={toggle}
      className="your-custom-styles"
    >
      {bookmarked ? 'Bookmarked ★' : 'Bookmark ☆'}
    </button>
  )}
/>
```

## Performance Characteristics

### Optimizations
- **Optimistic Updates**: Immediate UI feedback via ResourceBookmarkable
- **Efficient Re-renders**: Minimal re-renders through proper state management
- **Cached Queries**: ResourceBookmarkable handles query caching
- **Lightweight**: Small bundle size with SVG icons

### Bundle Impact
- Minimal JavaScript overhead
- Inline SVG (no external icon dependencies)
- Leverages existing authentication and state management

## Common Use Cases

### Article Feeds
```typescript
function ArticleFeed({ articles }) {
  return (
    <div className="feed">
      {articles.map(article => (
        <article key={article.id} className="feed-item">
          <h2>{article.title}</h2>
          <p>{article.excerpt}</p>
          <div className="actions">
            <ResourceBookmark 
              resource_type="ARTICLE" 
              resource_id={article.id} 
            />
          </div>
        </article>
      ))}
    </div>
  );
}
```

### Reading Lists
```typescript
function ReadingListItem({ article }) {
  return (
    <div className="reading-list-item">
      <div className="item-content">
        <h3>{article.title}</h3>
        <p>{article.author}</p>
      </div>
      <ResourceBookmark 
        resource_type="ARTICLE" 
        resource_id={article.id} 
      />
    </div>
  );
}
```

### Comment Threads
```typescript
function CommentThread({ comments }) {
  return (
    <div className="comment-thread">
      {comments.map(comment => (
        <div key={comment.id} className="comment">
          <p>{comment.content}</p>
          <div className="comment-meta">
            <span>{comment.author}</span>
            <ResourceBookmark 
              resource_type="COMMENT" 
              resource_id={comment.id} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Related Components

- **[ResourceBookmarkable](./ResourceBookmarkable.md)**: The underlying render prop component
- **[ResourceReaction](./ResourceReaction.md)**: Companion reaction component
- **[ArticleCard](./ArticleCard.md)**: Common usage context
- **useLoginPopup**: Authentication integration
- **useSession**: User session management

## Best Practices

### Usage Guidelines
```typescript
// Always provide both props
<ResourceBookmark 
  resource_type="ARTICLE"  // Required
  resource_id={articleId}  // Required
/>

// Group with related actions
<div className="content-actions">
  <ResourceReaction resource_type="ARTICLE" resource_id={id} />
  <ResourceBookmark resource_type="ARTICLE" resource_id={id} />
  <ShareButton />
</div>

// Consider accessibility
<div role="group" aria-label="Article actions">
  <ResourceBookmark resource_type="ARTICLE" resource_id={id} />
</div>
```

### Error Handling
```typescript
// Wrap in error boundary for production
<ErrorBoundary fallback={<div>Bookmark unavailable</div>}>
  <ResourceBookmark 
    resource_type="ARTICLE" 
    resource_id={articleId} 
  />
</ErrorBoundary>
```

### Performance
```typescript
// Use React.memo for lists
const MemoizedBookmark = React.memo(ResourceBookmark);

// In large lists
{articles.map(article => (
  <div key={article.id}>
    <MemoizedBookmark 
      resource_type="ARTICLE" 
      resource_id={article.id} 
    />
  </div>
))}
```