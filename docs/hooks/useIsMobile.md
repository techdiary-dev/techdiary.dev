# useIsMobile Hook

A custom hook for detecting mobile screen sizes using CSS media queries.

## Location
`src/hooks/use-mobile.ts`

## Signature
```typescript
function useIsMobile(): boolean
```

## Parameters
None

## Returns
- `boolean`: `true` if the screen width is below the mobile breakpoint (768px), `false` otherwise

## Usage Example

```typescript
import { useIsMobile } from '@/hooks/use-mobile';

function ResponsiveComponent() {
  const isMobile = useIsMobile();

  return (
    <div>
      {isMobile ? (
        <MobileLayout />
      ) : (
        <DesktopLayout />
      )}
    </div>
  );
}
```

## Features
- **Responsive breakpoint**: Uses 768px as the mobile breakpoint
- **Real-time updates**: Automatically updates when window is resized
- **SSR compatible**: Returns `false` initially to prevent hydration mismatches
- **Performance optimized**: Uses `matchMedia` for efficient media query listening

## Implementation Details
- **Breakpoint**: `MOBILE_BREAKPOINT = 768` pixels
- **Media Query**: `(max-width: 767px)`
- **Event Listener**: Automatically adds/removes resize event listeners
- **Initial State**: Starts with `undefined`, then updates to actual value on mount

## Common Use Cases
- Conditional rendering for mobile vs desktop layouts
- Responsive navigation menus
- Touch vs mouse interaction handling
- Mobile-specific features
- Responsive image loading
- Conditional component loading

## Important Notes
- The hook returns `false` during SSR to prevent hydration issues
- The breakpoint matches common CSS framework conventions (Bootstrap, Tailwind)
- Uses `matchMedia` for better performance than window resize events
- Properly cleans up event listeners on unmount

## Browser Support
- Modern browsers with `matchMedia` support
- Gracefully degrades in older browsers