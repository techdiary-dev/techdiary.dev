# useClickAway Hook

A custom hook that detects clicks outside of a specified element, commonly used for closing modals, dropdowns, and popovers.

## Location
`src/hooks/use-click-away.ts`

## Signature
```typescript
function useClickAway(
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void
): React.RefObject<HTMLElement | null>
```

## Parameters
- `ref`: React ref object pointing to the element to monitor
- `callback`: Function to execute when a click occurs outside the element

## Returns
- The same ref object passed as parameter (for convenience)

## Usage Example

```typescript
import { useClickAway } from '@/hooks/use-click-away';
import { useRef, useState } from 'react';

function DropdownComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useClickAway(dropdownRef, () => {
    setIsOpen(false);
  });

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle Dropdown
      </button>
      
      {isOpen && (
        <div ref={dropdownRef} className="dropdown-menu">
          <p>Dropdown Content</p>
          <p>Click outside to close</p>
        </div>
      )}
    </div>
  );
}
```

## Alternative Usage with useToggle

```typescript
import { useClickAway } from '@/hooks/use-click-away';
import { useToggle } from '@/hooks/use-toggle';
import { useRef } from 'react';

function ModalComponent() {
  const [isOpen, { close, toggle }] = useToggle();
  const modalRef = useRef<HTMLDivElement>(null);

  useClickAway(modalRef, close);

  return (
    <div>
      <button onClick={toggle}>Open Modal</button>
      
      {isOpen && (
        <div className="modal-overlay">
          <div ref={modalRef} className="modal-content">
            <h2>Modal Content</h2>
            <p>Click outside to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Features
- **Event delegation**: Uses `mousedown` event for reliable detection
- **Null safety**: Safely handles cases where ref.current is null
- **Automatic cleanup**: Removes event listeners on unmount
- **TypeScript support**: Fully typed with generic HTMLElement support
- **Performance optimized**: Only adds listeners when ref is available

## Implementation Details
- **Event type**: Uses `mousedown` instead of `click` for better UX
- **Event target**: Checks if click target is contained within the referenced element
- **Cleanup**: Properly removes event listeners in useEffect cleanup function
- **Dependencies**: Includes callback and ref in dependency array

## Common Use Cases
- **Dropdown menus**: Close when clicking outside
- **Modal dialogs**: Close modal on backdrop click
- **Popover components**: Dismiss popovers when clicking elsewhere
- **Context menus**: Hide context menus on outside click
- **Autocomplete**: Close suggestions when clicking away
- **Date pickers**: Close calendar when clicking outside
- **Tooltip management**: Hide tooltips on outside interaction

## Event Handling Details
- **Event**: `mousedown` (more responsive than `click`)
- **Target**: Uses `event.target as Node` for type safety
- **Containment**: Uses `element.contains()` to check if click is inside
- **Bubbling**: Attaches to `document` to catch all clicks

## Best Practices
- Always check if `ref.current` exists before using
- Use with state management hooks like `useToggle` for cleaner code
- Consider accessibility implications (ESC key handling, focus management)
- Test with keyboard navigation and screen readers

## Accessibility Considerations
- Should be combined with keyboard event handlers (ESC key)
- Ensure focus management when closing components
- Consider ARIA attributes for better screen reader support

## Browser Compatibility
- Modern browsers with full Event API support
- Uses standard DOM methods (`addEventListener`, `contains`)
- No special polyfills required