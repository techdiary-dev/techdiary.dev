# Custom Hooks Documentation

This directory contains comprehensive documentation for all custom React hooks used in the TechDiary application.

## Overview

Custom hooks are reusable functions that encapsulate stateful logic and side effects. They allow you to extract component logic into reusable functions that can be shared across multiple components.

## Available Custom Hooks

### State Management
- **[useToggle](./useToggle.md)** - Boolean state management with toggle, open, and close functions
- **[useIsMobile](./useIsMobile.md)** - Responsive breakpoint detection for mobile screens

### User Interaction
- **[useClickAway](./useClickAway.md)** - Detect clicks outside of specified elements
- **[useDebouncedCallback](./useDebouncedCallback.md)** - Debounce function calls to limit execution frequency

### UI Enhancement
- **[useAutosizeTextArea](./useAutosizeTextArea.md)** - Automatically resize textarea elements to fit content
- **[useMarkdownEditor](./useMarkdownEditor.md)** - Markdown editing commands for textarea elements

### File Management
- **[useServerFile](./useServerFile.md)** - File upload and deletion with cloud storage integration

### Context-Based Hooks (Require Providers)
- **[useAppConfirm](./useAppConfirm.md)** - Confirmation dialogs with customizable actions
- **[useAppAlert](./useAppAlert.md)** - Alert notifications with different types (error, warning, success, info)
- **[useLoginPopup](./useLoginPopup.md)** - GitHub OAuth login popup for authentication
- **[useTranslation](./useTranslation.md)** - Internationalization with Bengali/English support

## Quick Reference

| Hook | Purpose | Returns | Provider Required |
|------|---------|---------|-------------------|
| `useToggle` | Boolean state with actions | `[state, actions]` | No |
| `useIsMobile` | Mobile breakpoint detection | `boolean` | No |
| `useClickAway` | Outside click detection | `ref` | No |
| `useDebouncedCallback` | Debounced function calls | `debouncedCallback` | No |
| `useAutosizeTextArea` | Auto-resize textarea | `void` | No |
| `useMarkdownEditor` | Markdown commands | `{ executeCommand }` | No |
| `useServerFile` | File operations | `{ uploadFile, deleteFile, ...states }` | No |
| `useAppConfirm` | Confirmation dialogs | `{ show, closeModal }` | `AppConfirmProvider` |
| `useAppAlert` | Alert notifications | `{ show, closeModal }` | `AppAlertProvider` |
| `useLoginPopup` | Login popup | `{ show, closeModal }` | `AppLoginPopupProvider` |
| `useTranslation` | i18n translations | `{ _t, lang, toggle }` | No (uses Jotai) |

## Common Patterns

### 1. State Management with Actions
```typescript
const [isOpen, { toggle, open, close }] = useToggle();
```

### 2. Ref-based Hooks
```typescript
const ref = useRef<HTMLElement>(null);
useClickAway(ref, onClickAway);
```

### 3. Effect-based Hooks
```typescript
useAutosizeTextArea(textareaRef, value);
```

### 4. Function Return Hooks
```typescript
const debouncedSearch = useDebouncedCallback(search, 300);
```

### 5. Context-based Hooks
```typescript
const { show } = useAppConfirm();
const { _t } = useTranslation();
```

## Provider Setup

For context-based hooks, wrap your app with the required providers:

```typescript
import { 
  AppConfirmProvider, 
  AppAlertProvider, 
  AppLoginPopupProvider 
} from '@/components';

function App() {
  return (
    <AppConfirmProvider>
      <AppAlertProvider>
        <AppLoginPopupProvider>
          <YourAppContent />
        </AppLoginPopupProvider>
      </AppAlertProvider>
    </AppConfirmProvider>
  );
}
```

## Integration Examples

### Modal with Click Away and Toggle
```typescript
function Modal() {
  const [isOpen, { close, toggle }] = useToggle();
  const modalRef = useRef<HTMLDivElement>(null);
  
  useClickAway(modalRef, close);
  
  return (
    <>
      <button onClick={toggle}>Open Modal</button>
      {isOpen && (
        <div className="modal-overlay">
          <div ref={modalRef} className="modal">
            <p>Modal content</p>
          </div>
        </div>
      )}
    </>
  );
}
```

### Auto-resize Search with Debounced API Calls
```typescript
function SearchInput() {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const debouncedSearch = useDebouncedCallback(performSearch, 300);
  useAutosizeTextArea(textareaRef, query);
  
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };
  
  return (
    <textarea
      ref={textareaRef}
      value={query}
      onChange={handleChange}
      placeholder="Search..."
    />
  );
}
```

### Internationalized Confirmation Dialog
```typescript
function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const { show } = useAppConfirm();
  const { _t } = useTranslation();

  const handleDelete = () => {
    show({
      title: _t("Confirm Delete"),
      children: <p>{_t("This action cannot be undone")}</p>,
      labels: {
        confirm: _t("Delete"),
        cancel: _t("Cancel")
      },
      onConfirm: onDelete
    });
  };

  return <button onClick={handleDelete}>{_t("Delete")}</button>;
}
```

### Authentication-Protected Feature
```typescript
function ProtectedFeature() {
  const { show: showLogin } = useLoginPopup();
  const { show: showAlert } = useAppAlert();
  const { _t } = useTranslation();
  const user = useCurrentUser(); // Assume this exists

  const handleFeatureUse = () => {
    if (!user) {
      showLogin();
      return;
    }

    try {
      executeFeature();
      showAlert({
        title: _t("Success"),
        description: _t("Feature executed successfully"),
        type: "success"
      });
    } catch (error) {
      showAlert({
        title: _t("Error"),
        description: _t("Feature failed to execute"),
        type: "error"
      });
    }
  };

  return (
    <button onClick={handleFeatureUse}>
      {user ? _t("Use Feature") : _t("Login Required")}
    </button>
  );
}
```

## Hook Categories

### Basic Utility Hooks
Simple hooks that don't require external dependencies or providers:
- `useToggle`, `useIsMobile`, `useClickAway`, `useDebouncedCallback`

### UI Enhancement Hooks
Hooks that enhance user interface components:
- `useAutosizeTextArea`, `useMarkdownEditor`

### Service Integration Hooks
Hooks that integrate with external services:
- `useServerFile` (cloud storage), `useTranslation` (i18n)

### Application Context Hooks
Hooks that require provider setup for app-wide functionality:
- `useAppConfirm`, `useAppAlert`, `useLoginPopup`

## Best Practices

### 1. Hook Composition
- Combine multiple hooks for complex functionality
- Use smaller, focused hooks rather than large monolithic ones
- Follow the single responsibility principle

### 2. TypeScript Integration
- All hooks are fully typed
- Provide generic type parameters where applicable
- Use proper return type annotations

### 3. Performance Optimization
- Use `useCallback` and `useMemo` appropriately
- Minimize re-renders through proper dependency arrays
- Clean up resources in useEffect cleanup functions

### 4. Error Handling
- Handle edge cases (null refs, undefined values)
- Provide fallback behavior for error states
- Use proper TypeScript null checking

### 5. Provider Organization
- Group related providers together
- Consider provider order for dependencies
- Keep provider state minimal and focused

### 6. Testing
- Write unit tests for custom hooks using React Testing Library
- Test edge cases and error conditions
- Mock external dependencies appropriately

## Architecture Decisions

### File Organization
- Individual hooks in `/src/hooks/` directory
- Provider-based hooks in `/src/components/` directory
- Related hooks grouped by functionality
- Clear, descriptive file names

### Naming Conventions
- All hooks start with `use` prefix
- Descriptive names that indicate purpose
- Consistent parameter and return value naming

### Dependencies
- Minimal external dependencies
- Use React built-in hooks as foundation
- Leverage TypeScript for type safety
- Integration with application state management (Jotai)

## Contributing

When adding new custom hooks:

1. Create the hook in appropriate directory (`/src/hooks/` or `/src/components/`)
2. Follow existing patterns and naming conventions
3. Add comprehensive TypeScript types
4. Include JSDoc comments for better IDE support
5. Create documentation following the existing format
6. Add usage examples and common patterns
7. Update this README with the new hook
8. Consider if a provider is needed for global state

## Resources

- [React Hooks Official Documentation](https://react.dev/reference/react)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [TypeScript with React Hooks](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks)
- [Context API Best Practices](https://react.dev/learn/passing-data-deeply-with-context)