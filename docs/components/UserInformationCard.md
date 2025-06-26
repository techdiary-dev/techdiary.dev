# UserInformationCard Component

A comprehensive user profile card that displays user information, profile photo, bio, and interactive elements.

## Location
`src/components/UserInformationCard.tsx`

## Overview
UserInformationCard is a reusable component that fetches and displays detailed user information including profile photo, name, bio, location, education, and interactive buttons for profile management or following.

## Props

```typescript
interface Props {
  userId: string;
}
```

### Props Details
- `userId`: Unique identifier of the user to display

## Usage Examples

### Basic User Card
```typescript
import UserInformationCard from '@/components/UserInformationCard';

function UserProfile() {
  return (
    <div className="max-w-md mx-auto">
      <UserInformationCard userId="user-123" />
    </div>
  );
}
```

### In Hover Card (as used in ArticleCard)
```typescript
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

function ArticleAuthor({ authorId, authorName }) {
  return (
    <HoverCard openDelay={0}>
      <HoverCardTrigger>
        <button>{authorName}</button>
      </HoverCardTrigger>
      <HoverCardContent align="start">
        <UserInformationCard userId={authorId} />
      </HoverCardContent>
    </HoverCard>
  );
}
```

### User Directory
```typescript
function UserDirectory({ userIds }: { userIds: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {userIds.map(userId => (
        <div key={userId} className="border rounded-lg p-4">
          <UserInformationCard userId={userId} />
        </div>
      ))}
    </div>
  );
}
```

## Features

### User Data Display
- **Profile photo**: Optimized image display with fallbacks
- **Name and username**: Primary identification
- **Bio**: User description/introduction
- **Location**: Geographic information
- **Education**: Educational background

### Interactive Elements
- **Profile settings**: For current user (edit profile)
- **Follow button**: For other users (future implementation)
- **Responsive layout**: Adapts to container size

### Loading States
- **Skeleton loading**: Animated placeholder during data fetch
- **Progressive loading**: Shows structure while fetching data
- **Error handling**: Graceful fallback for failed requests

## Data Fetching

### React Query Integration
```typescript
const query = useQuery({
  queryKey: ["user", userId],
  queryFn: () => userActions.getUserById(userId),
});
```

### Loading State Rendering
```typescript
if (query.isPending) {
  return (
    <div className="h-45 relative flex flex-col gap-2">
      {/* Animated skeleton elements */}
      <div className="size-[56px] bg-gray-200 dark:bg-gray-800 animate-pulse" />
      <div className="h-4 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      {/* More skeleton elements */}
    </div>
  );
}
```

## Component Structure

### Profile Header
```typescript
<div className="py-3 flex items-center">
  {/* Avatar */}
  <div className="relative mr-4">
    <Image
      src={getFileUrl(query.data?.profile_photo)}
      alt={query.data?.name}
      width={56}
      height={56}
      className="w-14 h-14 rounded-full object-cover border-2 border-white/90 shadow-md"
    />
  </div>
  
  {/* Name and username */}
  <div>
    <h2 className="text-xl font-bold">{query.data?.name}</h2>
    <p className="text-sm text-muted-foreground">{query.data?.username}</p>
  </div>
</div>
```

### Interactive Buttons
```typescript
{session?.user?.id == userId ? (
  <Button className="w-full" asChild>
    <Link href="/dashboard/settings">{_t("Profile Settings")}</Link>
  </Button>
) : (
  <Button
    onClick={() => alert("Not implemented yet")}
    className="w-full"
  >
    {_t("Follow")}
  </Button>
)}
```

### Profile Details
```typescript
<div className="space-y-3">
  {/* Bio */}
  <p className="text-sm leading-relaxed text-muted-foreground">
    {query.data?.bio}
  </p>
  
  {/* Location */}
  {query.data?.location && (
    <div className="flex flex-col">
      <p className="font-semibold">{_t("Location")}</p>
      <p className="text-sm text-muted-foreground">{query.data?.location}</p>
    </div>
  )}
  
  {/* Education */}
  {query.data?.education && (
    <div className="flex flex-col">
      <p className="font-semibold">{_t("Education")}</p>
      <p className="text-sm text-muted-foreground">{query.data?.education}</p>
    </div>
  )}
</div>
```

## Hooks Used

### Custom Hooks
- `useTranslation`: For internationalized text
- `useSession`: For current user authentication state

### React Query
- `useQuery`: For fetching user data with caching and loading states

## Authentication Integration

### Current User Detection
```typescript
const session = useSession();
const isCurrentUser = session?.user?.id == userId;
```

### Conditional Rendering
- Shows "Profile Settings" button for current user
- Shows "Follow" button for other users
- Different interaction patterns based on authentication

## Internationalization

### Translated Labels
```typescript
{_t("Profile Settings")}  // Profile settings button
{_t("Follow")}           // Follow button
{_t("Location")}         // Location label
{_t("Education")}        // Education label
```

### Multi-language Support
- All user-facing text is translatable
- Proper text direction support
- Cultural formatting considerations

## Loading States

### Skeleton Design
- Matches actual content layout
- Smooth animation transitions
- Progressive disclosure pattern
- Accessible loading indicators

### Performance Optimization
- React Query caching prevents redundant requests
- Optimized re-renders through proper query keys
- Image optimization through `getFileUrl` utility

## Styling and Layout

### Container Styling
```typescript
// Flexible layout container
<div className="space-y-4">
  {/* Profile header */}
  {/* Interactive buttons */}
  {/* Profile details */}
</div>
```

### Avatar Styling
```typescript
className="w-14 h-14 rounded-full object-cover border-2 border-white/90 shadow-md"
```

### Responsive Considerations
- Adapts to container width
- Mobile-optimized touch targets
- Flexible image sizing
- Appropriate text scaling

## Error Handling

### Network Errors
- Graceful fallback for failed requests
- Error boundaries for component crashes
- Retry mechanisms through React Query

### Missing Data
- Conditional rendering for optional fields
- Fallback avatars for missing profile photos
- Default values for empty fields

## Accessibility Features

### Semantic HTML
- Proper heading hierarchy
- Descriptive image alt text
- Accessible button labels
- Screen reader friendly structure

### Keyboard Navigation
- Focusable interactive elements
- Logical tab order
- Proper ARIA attributes

## Performance Considerations

### Image Optimization
```typescript
// Optimized image loading
<Image
  src={getFileUrl(query.data?.profile_photo) ?? ""}
  width={56}
  height={56}
  className="w-14 h-14 rounded-full object-cover"
/>
```

### Query Optimization
- Proper query key structure for caching
- Automatic background refetching
- Stale-while-revalidate pattern

## Common Use Cases

### Author Hover Cards
```typescript
function ArticleAuthorHover({ authorId }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button>View Author</button>
      </HoverCardTrigger>
      <HoverCardContent>
        <UserInformationCard userId={authorId} />
      </HoverCardContent>
    </HoverCard>
  );
}
```

### User Search Results
```typescript
function UserSearchResults({ users }) {
  return (
    <div className="space-y-4">
      {users.map(user => (
        <UserInformationCard key={user.id} userId={user.id} />
      ))}
    </div>
  );
}
```

### Team Member Profiles
```typescript
function TeamSection({ teamMembers }) {
  return (
    <section>
      <h2>Our Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map(member => (
          <div key={member.id} className="bg-card rounded-lg p-6">
            <UserInformationCard userId={member.id} />
          </div>
        ))}
      </div>
    </section>
  );
}
```

## Integration with Other Components

### Related Components
- **AppImage**: For optimized profile photo display
- **Button**: For interactive elements
- **HoverCard**: For popup user previews
- **Link**: For navigation to user profiles

### Data Dependencies
- User data from `userActions.getUserById`
- Session data for authentication context
- File URL generation via `getFileUrl`

## Best Practices

### Data Management
```typescript
// Proper query key structure
queryKey: ["user", userId]

// Error handling
if (query.error) {
  return <ErrorMessage />;
}

// Loading states
if (query.isPending) {
  return <SkeletonLoader />;
}
```

### User Experience
```typescript
// Progressive loading
<div className="animate-pulse">
  {/* Skeleton content that matches real layout */}
</div>

// Clear visual hierarchy
<h2 className="text-xl font-bold">{name}</h2>
<p className="text-sm text-muted-foreground">{username}</p>

// Accessible interactions
<Button aria-label={`Follow ${userName}`}>
  {_t("Follow")}
</Button>
```

### Performance
```typescript
// Optimized images
width={56}
height={56}
className="w-14 h-14 rounded-full object-cover"

// Efficient queries
queryFn: () => userActions.getUserById(userId),
staleTime: 5 * 60 * 1000, // 5 minutes
```