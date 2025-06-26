# ResourceReaction Component

A flexible reaction system component that allows users to add emoji reactions to articles and comments.

## Location
`src/components/ResourceReaction.tsx`

## Overview
ResourceReaction provides an interactive emoji reaction system for articles and comments. It displays current reactions with counts and allows authenticated users to add/remove reactions through a hover interface.

## Props

```typescript
interface ResourceReactionProps {
  resource_type: "ARTICLE" | "COMMENT";
  resource_id: string;
}
```

### Props Details
- `resource_type`: Type of resource being reacted to ("ARTICLE" or "COMMENT")
- `resource_id`: Unique identifier of the resource

## Usage Examples

### Article Reactions
```typescript
import ResourceReaction from '@/components/ResourceReaction';

function ArticleCard({ article }) {
  return (
    <div className="article-card">
      <h2>{article.title}</h2>
      <p>{article.excerpt}</p>
      
      <div className="flex items-center justify-between mt-4">
        <ResourceReaction 
          resource_type="ARTICLE" 
          resource_id={article.id} 
        />
      </div>
    </div>
  );
}
```

### Comment Reactions
```typescript
function CommentItem({ comment }) {
  return (
    <div className="comment">
      <p>{comment.content}</p>
      
      <div className="comment-actions">
        <ResourceReaction 
          resource_type="COMMENT" 
          resource_id={comment.id} 
        />
      </div>
    </div>
  );
}
```

### In Article Pages
```typescript
function ArticlePage({ article }) {
  return (
    <article>
      <h1>{article.title}</h1>
      <div className="article-content">
        {article.content}
      </div>
      
      <footer className="article-footer">
        <ResourceReaction 
          resource_type="ARTICLE" 
          resource_id={article.id} 
        />
      </footer>
    </article>
  );
}
```

## Available Reaction Types

The component supports multiple emoji reactions:
- **LOVE**: Heart emoji for appreciation
- **FIRE**: Fire emoji for excitement  
- **WOW**: Wow emoji for amazement
- **HAHA**: Laugh emoji for humor
- **CRY**: Cry emoji for sadness
- **UNICORN**: Unicorn emoji for special content

Each reaction type has a corresponding SVG file in `/public/reactions/`.

## Component Structure

### Render Props Pattern
```typescript
<ResourceReactionable
  resource_type={resource_type}
  resource_id={resource_id}
  render={({ reactions, toggle }) => {
    // Rendering logic
  }}
/>
```

### Active Reactions Display
```typescript
{reactions
  .filter((r) => r.count)
  .map((reaction) => (
    <button
      key={reaction.reaction_type}
      onClick={() => toggle(reaction.reaction_type!)}
      className={`reaction-button ${
        reaction.is_reacted ? "bg-primary/20" : ""
      }`}
    >
      <img src={`/reactions/${reaction.reaction_type}.svg`} />
      <span>{reaction.count}</span>
    </button>
  ))}
```

### Reaction Picker (Hover Interface)
```typescript
<HoverCard openDelay={0}>
  <HoverCardTrigger asChild>
    <button className="add-reaction-button">
      <FaceIcon />
    </button>
  </HoverCardTrigger>
  <HoverCardContent>
    <div className="flex items-center gap-2 flex-wrap">
      {reactions.map((reaction) => (
        <button
          onClick={() => toggle(reaction.reaction_type!)}
          className={`reaction-picker-button ${
            reaction.is_reacted ? "bg-primary/20" : ""
          }`}
        >
          <img src={`/reactions/${reaction.reaction_type}.svg`} />
        </button>
      ))}
    </div>
  </HoverCardContent>
</HoverCard>
```

## Features

### Interactive Reactions
- **Click to toggle**: Add or remove reactions
- **Visual feedback**: Highlighted state for user's reactions
- **Count display**: Shows reaction counts
- **Hover interface**: Access to all reaction types

### Conditional Display
- **Active reactions**: Only shows reactions with counts > 0
- **Add button**: Appears when not all reactions are visible
- **User states**: Visual indication of user's reactions

### Authentication Integration
- Integrates with authentication system
- Prevents unauthorized reactions
- Maintains user reaction state

## Styling and States

### Button States
```typescript
// Default state
className="p-1 w-10 h-6 flex items-center gap-1 cursor-pointer rounded-sm hover:bg-primary/20"

// Reacted state (user has reacted)
className="... bg-primary/20"

// Hover picker button
className="p-1 border w-10 h-6 flex-none grid place-content-center cursor-pointer rounded-sm hover:bg-primary/20"
```

### Visual Indicators
- **Background highlight**: Active reactions have colored background
- **Hover effects**: Smooth transitions on interaction
- **Icon sizing**: Consistent 16px (size-4) and 20px (size-5) icons
- **Spacing**: Proper gap between elements

## Data Flow

### Reaction State Management
1. `ResourceReactionable` provides reaction data and toggle function
2. Component filters and displays active reactions
3. User clicks trigger toggle function
4. State updates reflect in UI immediately
5. Backend synchronization handled by render prop

### Authentication Flow
1. User attempts to react
2. Authentication status checked
3. Authenticated users can toggle reactions
4. Unauthenticated users see login prompt

## Accessibility Features

### Keyboard Navigation
- Focusable buttons for all interactions
- Proper tab order through reactions
- Enter/Space key activation

### Screen Reader Support
- Descriptive alt text for reaction images
- Meaningful button labels
- ARIA attributes for state communication

### Visual Accessibility
- High contrast hover states
- Clear visual feedback for interactions
- Consistent sizing and spacing

## Performance Optimizations

### Efficient Rendering
- Conditional rendering prevents unnecessary DOM nodes
- Filter operations minimize rendered elements
- Hover card lazy loading

### Image Optimization
- SVG reaction icons for scalability
- Consistent naming convention
- Optimized file sizes

## Integration with ResourceReactionable

### Render Props Pattern
The component uses the render props pattern through `ResourceReactionable`:

```typescript
// ResourceReactionable provides:
{
  reactions: Array<{
    reaction_type: string;
    count: number;
    is_reacted: boolean;
  }>;
  toggle: (reactionType: string) => void;
}
```

### Data Structure
```typescript
interface Reaction {
  reaction_type: "LOVE" | "FIRE" | "WOW" | "HAHA" | "CRY" | "UNICORN";
  count: number;
  is_reacted: boolean;
}
```

## Common Use Cases

### Article Engagement
```typescript
function ArticleEngagement({ articleId }) {
  return (
    <div className="flex items-center gap-4">
      <ResourceReaction 
        resource_type="ARTICLE" 
        resource_id={articleId} 
      />
      <ShareButton articleId={articleId} />
      <BookmarkButton articleId={articleId} />
    </div>
  );
}
```

### Comment Interactions
```typescript
function CommentActions({ commentId }) {
  return (
    <div className="comment-actions flex items-center gap-2">
      <ResourceReaction 
        resource_type="COMMENT" 
        resource_id={commentId} 
      />
      <ReplyButton commentId={commentId} />
    </div>
  );
}
```

### Bulk Content Display
```typescript
function ContentFeed({ items }) {
  return (
    <div className="content-feed">
      {items.map(item => (
        <div key={item.id} className="content-item">
          <h3>{item.title}</h3>
          <p>{item.content}</p>
          <ResourceReaction 
            resource_type={item.type} 
            resource_id={item.id} 
          />
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

### Network Errors
- Graceful fallback for failed reactions
- Optimistic updates with rollback on failure
- User feedback for connection issues

### Invalid States
- Handles missing reaction data
- Fallback for unsupported reaction types
- Proper error boundaries

## Customization Options

### Styling Customization
```typescript
// Custom button styling
<button className="custom-reaction-button">
  <img src={`/reactions/${reaction.reaction_type}.svg`} />
  <span className="custom-count">{reaction.count}</span>
</button>
```

### Layout Variations
```typescript
// Horizontal layout (default)
<div className="flex gap-2">
  {/* Reactions */}
</div>

// Vertical layout
<div className="flex flex-col gap-1">
  {/* Reactions */}
</div>

// Grid layout
<div className="grid grid-cols-3 gap-1">
  {/* Reactions */}
</div>
```

## Best Practices

### Performance
```typescript
// Efficient filtering
.filter((r) => r.count > 0)

// Memoized event handlers
const handleToggle = useCallback((type) => {
  toggle(type);
}, [toggle]);

// Optimized re-renders
React.memo(ResourceReaction);
```

### User Experience
```typescript
// Clear visual feedback
className={reaction.is_reacted ? "bg-primary/20" : ""}

// Accessible hover states
openDelay={0} // Immediate hover response

// Meaningful labels
alt={`reaction-${resource_id}-${reaction.reaction_type}`}
```

### Data Management
```typescript
// Consistent prop types
resource_type: "ARTICLE" | "COMMENT"

// Proper error handling
if (!reactions) return null;

// Optimistic updates
toggle(reactionType); // Immediate UI update
```