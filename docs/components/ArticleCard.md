# ArticleCard Component

A reusable card component for displaying article information in feeds and lists.

## Location
`src/components/ArticleCard.tsx`

## Overview
The ArticleCard component displays a preview of an article with author information, cover image, metadata, and interaction buttons. It includes hover effects and user profile previews.

## Props

```typescript
interface ArticleCardProps {
  id: string;
  title: string;
  handle: string;
  excerpt: string;
  coverImage?: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  publishedAt: string;
  readingTime: number;
}
```

### Required Props
- `id`: Unique article identifier
- `title`: Article title
- `handle`: URL-friendly article identifier
- `excerpt`: Brief article summary
- `author`: Author information object
- `publishedAt`: Publication date (ISO string)
- `readingTime`: Estimated reading time in minutes

### Optional Props
- `coverImage`: URL to article cover image

## Usage Example

```typescript
import ArticleCard from '@/components/ArticleCard';

function ArticleFeed() {
  const articles = [
    {
      id: "1",
      title: "Getting Started with React Hooks",
      handle: "getting-started-react-hooks",
      excerpt: "Learn the fundamentals of React Hooks and how to use them effectively in your applications.",
      coverImage: "https://example.com/cover.jpg",
      author: {
        id: "user1",
        name: "John Doe",
        avatar: "https://example.com/avatar.jpg",
        username: "johndoe"
      },
      publishedAt: "2024-01-15T10:00:00Z",
      readingTime: 5
    }
  ];

  return (
    <div className="space-y-4">
      {articles.map(article => (
        <ArticleCard key={article.id} {...article} />
      ))}
    </div>
  );
}
```

## Features

### Author Information Display
- Author avatar with hover card preview
- Author name linked to profile
- Publication date (localized)
- Reading time estimate

### Content Preview
- Article title with hover effects
- Excerpt with "Read more" link
- Optional cover image with aspect ratio 16:9

### User Interactions
- **Reactions**: Emoji-based reactions (like, love, etc.)
- **Bookmarking**: Save article for later reading
- **Authentication**: Login prompt for unauthenticated users

### Responsive Design
- Mobile-optimized layout
- Smooth hover transitions
- Adaptive spacing and typography

## Dependencies

### Hooks Used
- `useTranslation`: For internationalization
- `useSession`: For user authentication state
- `useLoginPopup`: For authentication prompts

### Child Components
- `UserInformationCard`: Author profile preview
- `ResourceReaction`: Article reaction system
- `ResourceBookmark`: Bookmark functionality
- `HoverCard`: Author info hover preview

## Styling Classes

The component uses Tailwind CSS classes for styling:
- Container: `flex flex-col p-4 sm:p-5 group`
- Author section: Flex layout with avatar and metadata
- Title: `text-lg font-bold` with hover effects
- Cover image: `aspect-[16/9]` with responsive sizing

## Internationalization

The component supports multiple languages:
- Reading time text is localized
- Date formatting respects language preference
- All interactive elements use translated text

## Performance Optimizations

- **Memoized URL**: Article URL is memoized to prevent recalculation
- **Optimized images**: Uses Next.js Image component with proper sizing
- **Hover delays**: HoverCard has optimized delay for better UX

## Accessibility Features

- Semantic HTML structure
- Proper alt text for images
- Keyboard navigation support
- Screen reader friendly markup
- Time elements with proper datetime attributes

## Data Flow

1. Article data passed as props
2. User authentication checked via session
3. Internationalization applied to dates/text
4. User interactions handled through child components
5. Navigation handled via Next.js Link components

## Common Use Cases

### Article Feeds
```typescript
function Homepage() {
  return (
    <div className="article-feed">
      {articles.map(article => (
        <ArticleCard key={article.id} {...article} />
      ))}
    </div>
  );
}
```

### Search Results
```typescript
function SearchResults({ results }: { results: Article[] }) {
  return (
    <div className="search-results">
      {results.map(article => (
        <ArticleCard key={article.id} {...article} />
      ))}
    </div>
  );
}
```

### User Profile Articles
```typescript
function UserArticles({ userId }: { userId: string }) {
  const { data: articles } = useUserArticles(userId);
  
  return (
    <div className="user-articles">
      {articles?.map(article => (
        <ArticleCard key={article.id} {...article} />
      ))}
    </div>
  );
}
```

## Customization

The component can be customized through:
- CSS classes for styling overrides
- Props for different data structures
- Child component replacement for different functionality

## Related Components

- **UserInformationCard**: Displays detailed user information
- **ResourceReaction**: Handles article reactions
- **ResourceBookmark**: Manages article bookmarking
- **AppImage**: Optimized image handling

## Best Practices

1. **Data validation**: Ensure all required props are provided
2. **Error handling**: Handle missing images or data gracefully
3. **Performance**: Use proper keys when rendering lists
4. **Accessibility**: Provide meaningful alt text and ARIA labels
5. **Responsive**: Test on various screen sizes