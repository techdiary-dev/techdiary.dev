# useToggle Hook

A custom hook for managing boolean state with convenient toggle, open, and close functions.

## Location
`src/hooks/use-toggle.ts`

## Signature
```typescript
function useToggle(initialState?: boolean): [boolean, { toggle: () => void; close: () => void; open: () => void; }]
```

## Parameters
- `initialState` (optional): Initial boolean state. Defaults to `false`.

## Returns
Returns a tuple with:
- `state`: Current boolean state
- `actions`: Object containing:
  - `toggle()`: Flips the current state
  - `close()`: Sets state to `false`
  - `open()`: Sets state to `true`

## Usage Example

```typescript
import { useToggle } from '@/hooks/use-toggle';

function MyComponent() {
  const [isOpen, { toggle, close, open }] = useToggle(false);

  return (
    <div>
      <p>Modal is {isOpen ? 'open' : 'closed'}</p>
      <button onClick={toggle}>Toggle Modal</button>
      <button onClick={open}>Open Modal</button>
      <button onClick={close}>Close Modal</button>
    </div>
  );
}
```

## Features
- **Memoized callbacks**: All action functions are memoized with `useCallback` to prevent unnecessary re-renders
- **TypeScript support**: Fully typed with proper return type inference
- **Flexible initial state**: Can start with any boolean value

## Common Use Cases
- Modal/dialog visibility
- Dropdown menu state
- Sidebar toggle
- Form field visibility
- Loading states
- Feature flags

## Implementation Details
- Uses React's `useState` for state management
- All callbacks are wrapped in `useCallback` for performance optimization
- Returns a tuple for easy destructuring with custom names