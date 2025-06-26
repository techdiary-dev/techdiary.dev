# useAppAlert Hook

A context-based hook for displaying alert notifications with different types (error, warning, success, info) throughout the application.

## Location
`src/components/app-alert.tsx`

## Provider
`AppAlertProvider` - Must wrap your app or component tree to use this hook

## Signature
```typescript
function useAppAlert(): {
  show: (options: Options) => void;
  closeModal: () => void;
}
```

## Options Interface
```typescript
interface Options {
  title: string;
  description?: string;
  type?: "warning" | "error" | "success" | "info";
  isShowCancel?: boolean;
  isShowConfirm?: boolean;
}
```

## Parameters
None - Hook uses React Context

## Returns
An object containing:
- `show`: Function to display alert dialog
- `closeModal`: Function to manually close the dialog

## Setup

### 1. Wrap Your App with Provider
```typescript
import { AppAlertProvider } from '@/components/app-alert';

function App() {
  return (
    <AppAlertProvider>
      <YourAppContent />
    </AppAlertProvider>
  );
}
```

### 2. Use the Hook
```typescript
import { useAppAlert } from '@/components/app-alert';

function MyComponent() {
  const { show } = useAppAlert();

  const handleError = () => {
    show({
      title: "Operation Failed",
      description: "Unable to save your changes. Please try again.",
      type: "error"
    });
  };

  const handleSuccess = () => {
    show({
      title: "Success!",
      description: "Your changes have been saved successfully.",
      type: "success"
    });
  };

  return (
    <div>
      <button onClick={handleError}>Trigger Error</button>
      <button onClick={handleSuccess}>Trigger Success</button>
    </div>
  );
}
```

## Alert Types

### Error Alert
```typescript
const { show } = useAppAlert();

show({
  title: "Error",
  description: "Something went wrong. Please try again later.",
  type: "error"
});
```

### Warning Alert
```typescript
show({
  title: "Warning",
  description: "This action may have unintended consequences.",
  type: "warning"
});
```

### Success Alert
```typescript
show({
  title: "Success",
  description: "Your action was completed successfully.",
  type: "success"
});
```

### Info Alert
```typescript
show({
  title: "Information",
  description: "Here's some helpful information for you.",
  type: "info"
});
```

## Advanced Usage Examples

### Error Handling in API Calls
```typescript
function DataFetcher() {
  const { show } = useAppAlert();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');
      
      show({
        title: "Data Loaded",
        description: "Successfully loaded the latest data.",
        type: "success"
      });
    } catch (error) {
      show({
        title: "Loading Failed",
        description: "Could not load data. Please check your connection and try again.",
        type: "error"
      });
    }
  };

  return <button onClick={fetchData}>Load Data</button>;
}
```

### Form Validation Alerts
```typescript
function FormComponent() {
  const { show } = useAppAlert();

  const validateAndSubmit = (formData: FormData) => {
    if (!formData.email) {
      show({
        title: "Validation Error",
        description: "Please provide a valid email address.",
        type: "warning"
      });
      return;
    }

    // Submit form
    show({
      title: "Form Submitted",
      description: "Thank you! Your form has been submitted successfully.",
      type: "success"
    });
  };

  return (
    <form onSubmit={validateAndSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### User Onboarding Tips
```typescript
function OnboardingTips() {
  const { show } = useAppAlert();

  const showTip = () => {
    show({
      title: "Pro Tip",
      description: "You can use keyboard shortcuts to navigate faster. Press 'H' for help.",
      type: "info"
    });
  };

  return <button onClick={showTip}>Show Tip</button>;
}
```

## Visual Indicators

Each alert type displays a different icon:
- **Error**: Red CircleX icon
- **Warning**: Yellow warning triangle
- **Success**: Green checkmark (using warning icon as placeholder)
- **Info**: Blue info circle

## Options Details

### Required Options
- `title`: Alert title text

### Optional Options
- `description`: Additional descriptive text
- `type`: Alert type - "error" (default), "warning", "success", "info"
- `isShowCancel`: Currently not used in implementation
- `isShowConfirm`: Currently not used in implementation

## Features
- **Context-based**: Uses React Context for global state management
- **Type-based styling**: Different icons and colors for each alert type
- **Internationalization**: Uses translation hook for "Close" button
- **Accessible**: Built with AlertDialog component for accessibility
- **TypeScript support**: Fully typed with proper interfaces
- **Memoized rendering**: Optimized icon rendering with useMemo

## Implementation Details
- Uses `useState` for dialog state and content management
- Uses `useCallback` for memoized event handlers
- Uses `useMemo` for optimized icon rendering
- Built on top of shadcn/ui AlertDialog component
- Integrates with i18n translation system
- Renders icons conditionally based on alert type

## Common Use Cases
- **API error handling**: Display server error messages
- **Form validation**: Show validation errors and warnings
- **Success notifications**: Confirm successful operations
- **User guidance**: Provide helpful information and tips
- **System status**: Notify users about system states
- **Feature announcements**: Inform users about new features
- **Maintenance notices**: Alert users about system maintenance

## Best Practices
- Use appropriate alert types for different situations
- Keep titles concise and descriptions informative
- Provide actionable information when possible
- Use error alerts for failures, warnings for cautions
- Use success alerts for confirmations
- Use info alerts for helpful tips and information

## Error Handling
The hook will throw an error if used outside of `AppAlertProvider`:
```
Error: useAppAlert must be used within a AppAlertProvider
```

## Styling
- Icons are styled with appropriate colors for each type
- Error icons use `text-destructive` class
- Warning icons use `text-warning` class
- Success icons use `text-success` class
- Info icons use default text color
- Icons are sized at `size-20` (80px)

## Internationalization
- Uses `useTranslation` hook for localized text
- "Close" button text is translated based on current language
- Supports Bengali and English languages

## Performance Considerations
- Icon rendering is memoized with `useMemo`
- Provider state is isolated to prevent unnecessary re-renders
- Callbacks are memoized to prevent function recreation
- Lightweight state management with minimal overhead