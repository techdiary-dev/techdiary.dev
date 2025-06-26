# useDebouncedCallback Hook

A custom hook that creates a debounced version of a callback function, useful for limiting API calls or expensive operations.

## Location
`src/hooks/use-debounced-callback.ts`

## Signature
```typescript
function useDebouncedCallback(
  callback: (value: string) => void,
  delay: number
): (value: string) => void
```

## Parameters
- `callback`: The function to be debounced. Must accept a string parameter.
- `delay`: The delay in milliseconds before the callback is executed.

## Returns
- `debouncedCallback`: A debounced version of the original callback function.

## Usage Example

```typescript
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { useState } from 'react';

function SearchComponent() {
  const [query, setQuery] = useState('');

  const debouncedSearch = useDebouncedCallback((searchTerm: string) => {
    // This will only execute 500ms after the user stops typing
    console.log('Searching for:', searchTerm);
    performSearch(searchTerm);
  }, 500);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value); // This is debounced
  };

  return (
    <input
      type="text"
      value={query}
      onChange={handleInputChange}
      placeholder="Search..."
    />
  );
}
```

## Features
- **Automatic cleanup**: Previous timeouts are cleared when new calls are made
- **Memoized**: The debounced function is memoized to prevent unnecessary re-creations
- **TypeScript support**: Fully typed with proper parameter inference
- **Memory safe**: Properly cleans up timeouts to prevent memory leaks

## Implementation Details
- Uses `useRef` to store the timeout reference
- Uses `useCallback` to memoize the debounced function
- Automatically clears previous timeouts before setting new ones
- Dependencies array includes `callback` and `delay` for proper re-memoization

## Common Use Cases
- **Search input**: Debounce API calls while user types
- **Form validation**: Delay validation until user stops typing
- **Auto-save**: Debounce save operations in editors
- **Resize handlers**: Limit expensive calculations on window resize
- **Scroll handlers**: Reduce scroll event processing
- **API rate limiting**: Prevent excessive API calls

## Performance Benefits
- Reduces unnecessary function calls
- Prevents API spam
- Improves application responsiveness
- Reduces server load
- Minimizes expensive computations

## Best Practices
- Use reasonable delay values (200-500ms for search, 1000ms+ for auto-save)
- Consider user experience when choosing delay duration
- Test with real user interaction patterns
- Monitor for memory leaks in long-running applications