# useAppConfirm Hook

A context-based hook for displaying confirmation dialogs throughout the application using a provider pattern.

## Location
`src/components/app-confirm.tsx`

## Provider
`AppConfirmProvider` - Must wrap your app or component tree to use this hook

## Signature
```typescript
function useAppConfirm(): {
  show: (options: Options) => void;
  closeModal: () => void;
}
```

## Options Interface
```typescript
interface Options {
  title: string;
  children?: React.ReactNode;
  labels?: {
    confirm?: string;
    cancel?: string;
  };
  onCancel?: () => void;
  onConfirm?: () => void;
  isShowCancel?: boolean;
  isShowConfirm?: boolean;
}
```

## Parameters
None - Hook uses React Context

## Returns
An object containing:
- `show`: Function to display confirmation dialog
- `closeModal`: Function to manually close the dialog

## Setup

### 1. Wrap Your App with Provider
```typescript
import { AppConfirmProvider } from '@/components/app-confirm';

function App() {
  return (
    <AppConfirmProvider>
      <YourAppContent />
    </AppConfirmProvider>
  );
}
```

### 2. Use the Hook
```typescript
import { useAppConfirm } from '@/components/app-confirm';

function MyComponent() {
  const { show, closeModal } = useAppConfirm();

  const handleDelete = () => {
    show({
      title: "Delete Item",
      children: <p>Are you sure you want to delete this item? This action cannot be undone.</p>,
      labels: {
        confirm: "Delete",
        cancel: "Cancel"
      },
      onConfirm: () => {
        // Perform delete action
        console.log("Item deleted");
      },
      onCancel: () => {
        console.log("Delete cancelled");
      }
    });
  };

  return (
    <button onClick={handleDelete}>
      Delete Item
    </button>
  );
}
```

## Advanced Usage Examples

### Simple Confirmation
```typescript
function SimpleConfirm() {
  const { show } = useAppConfirm();

  const handleAction = () => {
    show({
      title: "Confirm Action",
      children: <p>Do you want to proceed?</p>,
      onConfirm: () => {
        // Proceed with action
      }
    });
  };

  return <button onClick={handleAction}>Proceed</button>;
}
```

### Custom Labels and Actions
```typescript
function CustomConfirm() {
  const { show } = useAppConfirm();

  const handleLogout = () => {
    show({
      title: "Sign Out",
      children: (
        <div>
          <p>You will be signed out of your account.</p>
          <p>Any unsaved changes will be lost.</p>
        </div>
      ),
      labels: {
        confirm: "Sign Out",
        cancel: "Stay Signed In"
      },
      onConfirm: async () => {
        await signOut();
        window.location.href = '/';
      }
    });
  };

  return <button onClick={handleLogout}>Sign Out</button>;
}
```

### Information Only (No Cancel Button)
```typescript
function InfoDialog() {
  const { show } = useAppConfirm();

  const showInfo = () => {
    show({
      title: "Information",
      children: <p>This is an informational message.</p>,
      labels: {
        confirm: "Got it"
      },
      isShowCancel: false,
      onConfirm: () => {
        console.log("User acknowledged");
      }
    });
  };

  return <button onClick={showInfo}>Show Info</button>;
}
```

## Options Details

### Required Options
- `title`: Dialog title text

### Optional Options
- `children`: React content for dialog body
- `labels.confirm`: Custom confirm button text (default: "Continue")
- `labels.cancel`: Custom cancel button text (default: "Cancel")
- `onConfirm`: Callback when confirm button is clicked
- `onCancel`: Callback when cancel button is clicked
- `isShowCancel`: Show/hide cancel button (default: true)
- `isShowConfirm`: Show/hide confirm button (default: true)

## Features
- **Context-based**: Uses React Context for global state management
- **Customizable**: Flexible options for different use cases
- **Accessible**: Built with AlertDialog component for accessibility
- **TypeScript support**: Fully typed with proper interfaces
- **Auto-close**: Confirm button automatically closes dialog
- **Memoized callbacks**: Optimized performance with useCallback

## Implementation Details
- Uses `useState` for dialog state and content management
- Uses `useCallback` for memoized event handlers
- Built on top of shadcn/ui AlertDialog component
- Renders dialog conditionally based on open state
- Automatically closes dialog when confirm is clicked

## Common Use Cases
- **Delete confirmations**: Confirm destructive actions
- **Form submissions**: Confirm important form actions
- **Navigation warnings**: Warn about unsaved changes
- **Logout confirmations**: Confirm user logout
- **Bulk actions**: Confirm operations on multiple items
- **Purchase confirmations**: Confirm payments or orders
- **Settings changes**: Confirm critical setting changes

## Best Practices
- Always provide clear, descriptive titles
- Use appropriate button labels that match the action
- Provide detailed explanations in the children content
- Handle both confirm and cancel actions appropriately
- Consider accessibility with proper ARIA attributes
- Test with keyboard navigation and screen readers

## Error Handling
The hook will throw an error if used outside of `AppConfirmProvider`:
```
Error: useAppConfirm must be used within a ModalProvider
```

## Styling
- Uses shadcn/ui AlertDialog components
- Confirm button uses "destructive" variant by default
- Cancel button uses "secondary" variant
- Fully themeable through CSS variables

## Performance Considerations
- Provider state is isolated to prevent unnecessary re-renders
- Callbacks are memoized to prevent function recreation
- Dialog content is only rendered when needed
- Lightweight state management with minimal overhead