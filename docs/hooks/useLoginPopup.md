# useLoginPopup Hook

A context-based hook for displaying GitHub OAuth login popup throughout the application.

## Location
`src/components/app-login-popup.tsx`

## Provider
`AppLoginPopupProvider` - Must wrap your app or component tree to use this hook

## Signature
```typescript
function useLoginPopup(): {
  show: () => void;
  closeModal: () => void;
}
```

## Parameters
None - Hook uses React Context

## Returns
An object containing:
- `show`: Function to display login popup
- `closeModal`: Function to manually close the popup

## Setup

### 1. Wrap Your App with Provider
```typescript
import { AppLoginPopupProvider } from '@/components/app-login-popup';

function App() {
  return (
    <AppLoginPopupProvider>
      <YourAppContent />
    </AppLoginPopupProvider>
  );
}
```

### 2. Use the Hook
```typescript
import { useLoginPopup } from '@/components/app-login-popup';

function LoginButton() {
  const { show } = useLoginPopup();

  return (
    <button onClick={show}>
      Sign In
    </button>
  );
}
```

## Usage Examples

### Basic Login Trigger
```typescript
function Header() {
  const { show } = useLoginPopup();

  return (
    <header>
      <nav>
        <button onClick={show}>Login</button>
      </nav>
    </header>
  );
}
```

### Protected Action with Login Prompt
```typescript
function ProtectedAction() {
  const { show } = useLoginPopup();
  const user = useCurrentUser(); // Assume this hook exists

  const handleAction = () => {
    if (!user) {
      show(); // Show login popup if not authenticated
      return;
    }
    
    // Perform protected action
    performAction();
  };

  return (
    <button onClick={handleAction}>
      {user ? 'Perform Action' : 'Login to Continue'}
    </button>
  );
}
```

### Comment System Integration
```typescript
function CommentForm() {
  const { show } = useLoginPopup();
  const [comment, setComment] = useState('');
  const user = useCurrentUser();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!user) {
      show(); // Prompt login before commenting
      return;
    }
    
    submitComment(comment);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea 
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={user ? "Write a comment..." : "Login to comment"}
      />
      <button type="submit">
        {user ? 'Post Comment' : 'Login to Comment'}
      </button>
    </form>
  );
}
```

## Features
- **Context-based**: Uses React Context for global state management
- **GitHub OAuth**: Integrated with GitHub OAuth authentication
- **URL preservation**: Maintains current URL in `next` parameter for redirect after login
- **Internationalization**: Uses translation hook for localized text
- **Accessible**: Built with AlertDialog component for accessibility
- **Brand integration**: Includes Techdiary logo and branding
- **TypeScript support**: Fully typed with proper interfaces

## Implementation Details
- Uses `useState` for dialog open/close state
- Uses `useCallback` for memoized event handlers
- Uses `useSearchParams` to preserve redirect URL
- Built on top of shadcn/ui AlertDialog component
- Integrates with i18n translation system
- Links to `/api/auth/github` OAuth endpoint

## OAuth Flow
1. User clicks login trigger
2. Login popup displays with GitHub OAuth option
3. User clicks "Login with Github" link
4. Redirects to `/api/auth/github?next={currentUrl}`
5. GitHub OAuth handles authentication
6. User redirected back to original page after login

## Common Use Cases
- **Gated content**: Require login to access features
- **Comment systems**: Login required for commenting
- **Bookmarking**: Login required to save bookmarks
- **User profiles**: Access to user-specific features
- **Article creation**: Login required for content creation
- **Reactions**: Login required for article reactions
- **Social features**: Any user-specific functionality

## Authentication Integration
```typescript
// Example with auth state
function AuthenticatedFeature() {
  const { show } = useLoginPopup();
  const { user, loading } = useAuth(); // Your auth hook

  if (loading) return <div>Loading...</div>;

  const handleFeatureClick = () => {
    if (!user) {
      show();
      return;
    }
    
    // Execute authenticated feature
    executeFeature();
  };

  return (
    <button onClick={handleFeatureClick}>
      {user ? 'Use Feature' : 'Login Required'}
    </button>
  );
}
```

## URL Handling
The hook automatically preserves the current URL for post-login redirect:
- Current URL is captured via `useSearchParams`
- Passed as `next` parameter to OAuth endpoint
- User redirected back after successful authentication

## Best Practices
- Use for any feature that requires authentication
- Provide clear indication when login is required
- Handle loading states during authentication
- Consider UX flow for post-login actions
- Test with various redirect scenarios
- Ensure proper error handling for OAuth failures

## Error Handling
The hook will throw an error if used outside of `AppLoginPopupProvider`:
```
Error: useLoginPopup must be used within a ModalProvider
```

## Styling
- Uses shadcn/ui AlertDialog components
- Includes Techdiary branding and logo
- GitHub OAuth button with GitHub icon
- Responsive design for mobile and desktop
- Consistent with application theme

## Internationalization
- Uses `useTranslation` hook for localized text
- Supports Bengali and English languages
- Login button text adapts to current language
- Description text is translatable

## Security Considerations
- OAuth flow handled server-side for security
- No sensitive data stored in client-side state
- Secure redirect handling via `next` parameter
- GitHub OAuth provides secure authentication

## Performance Considerations
- Lightweight provider with minimal overhead
- Dialog only rendered when needed
- Callbacks are memoized to prevent function recreation
- Search params only accessed when needed