# Custom Components Documentation

This directory contains comprehensive documentation for all custom React components used in the TechDiary application (excluding shadcn/ui components).

## Overview

Custom components are reusable UI elements that encapsulate specific functionality and design patterns. They provide consistent interfaces, behavior, and styling throughout the application.

## Available Custom Components

### Core Content Components
- **[ArticleCard](./ArticleCard.md)** - Article preview cards for feeds and lists
- **[ArticleEditor](./ArticleEditor.md)** - Comprehensive markdown editor with auto-save
- **[UserInformationCard](./UserInformationCard.md)** - User profile display with interactions

### Media and Upload Components
- **[AppImage](./AppImage.md)** - Optimized image component with Cloudinary integration
- **[ImageDropzoneWithCropper](./ImageDropzoneWithCropper.md)** - File upload with cropping capabilities

### Interactive Components
- **[ResourceReaction](./ResourceReaction.md)** - Emoji reaction system for articles and comments (UI implementation of ResourceReactionable)
- **[ResourceBookmark](./ResourceBookmark.md)** - Bookmark button for articles and comments (UI implementation of ResourceBookmarkable)

### Render Props Components
- **[ResourceReactionable](./ResourceReactionable.md)** - Render prop for reaction functionality with optimistic updates
- **[ResourceBookmarkable](./ResourceBookmarkable.md)** - Render prop for bookmark functionality with state management

### Navigation Components
- **Navbar** - Main application navigation with search and user actions
- **ThemeSwitcher** - Dark/light theme toggle component
- **LanguageSwitcher** - Bengali/English language toggle

### Layout Components
- **BaseLayout** - Base application layout wrapper
- **HomepageLayout** - Homepage-specific layout structure

### Provider Components
- **CommonProviders** - Application-wide context providers
- **SessionProvider** - User session management
- **I18nProvider** - Internationalization context

### Widget Components
- **DiscordWidget** - Discord community integration
- **SocialLinksWidget** - Social media links display
- **LatestUsers** - Recent user registrations display
- **ImportantLinksWidget** - Curated links section

## Component Categories

### UI Components (Main Interface)
Components that form the primary user interface:
- ArticleCard, ArticleEditor, UserInformationCard
- Navbar, navigation components
- Layout wrappers and providers

### Media Components
Components handling images and file uploads:
- AppImage with Cloudinary optimization
- ImageDropzoneWithCropper for uploads
- File management utilities

### Interactive Components  
Components providing user interactions:
- ResourceReaction for emoji reactions (UI implementation of ResourceReactionable)
- ResourceBookmark for saving content (UI implementation of ResourceBookmarkable)
- Comment system components

### Render Props Components
Components that provide data and logic via render props pattern:
- ResourceReactionable for reaction functionality
- ResourceBookmarkable for bookmark functionality
- Flexible UI rendering with complete control

### Utility Components
Helper components for specific functions:
- VisibilitySensor for scroll detection
- Toast notifications
- Social login cards
- Icon components

## Quick Reference

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `ArticleCard` | Article preview | Author info, reactions, bookmarking |
| `ArticleEditor` | Content creation | Markdown editing, auto-save, preview |
| `AppImage` | Optimized images | Cloudinary integration, lazy loading |
| `ImageDropzoneWithCropper` | File uploads | Drag-and-drop, cropping, cloud storage |
| `UserInformationCard` | User profiles | Bio, social info, follow/edit actions |
| `ResourceReaction` | Emoji reactions UI | Pre-built UI using ResourceReactionable |
| `ResourceBookmark` | Bookmark button UI | Pre-built UI using ResourceBookmarkable |
| `ResourceReactionable` | Reaction logic | Render props, optimistic updates, auth |
| `ResourceBookmarkable` | Bookmark logic | Render props, state sync, optimistic UI |

## Common Patterns

### 1. Props Interface Pattern
```typescript
interface ComponentProps {
  // Required props
  id: string;
  title: string;
  
  // Optional props with defaults
  variant?: "primary" | "secondary";
  disabled?: boolean;
  
  // Callback functions
  onAction?: (data: any) => void;
  
  // Children and composition
  children?: React.ReactNode;
}
```

### 2. Hooks Integration Pattern
```typescript
function CustomComponent() {
  // Translation and i18n
  const { _t } = useTranslation();
  
  // Authentication
  const session = useSession();
  
  // UI state management
  const [isOpen, { toggle, close }] = useToggle();
  
  // API integration
  const { data, isLoading } = useQuery({...});
  
  return (/* JSX */);
}
```

### 3. Conditional Rendering Pattern
```typescript
// Loading states
if (isLoading) return <SkeletonLoader />;

// Error states
if (error) return <ErrorMessage error={error} />;

// Authentication-based rendering
{session ? (
  <AuthenticatedContent />
) : (
  <LoginPrompt />
)}

// Feature flags and permissions
{hasPermission && <PrivilegedAction />}
```

### 4. Event Handling Pattern
```typescript
const handleAction = useCallback((event: Event) => {
  // Prevent defaults
  event.preventDefault();
  
  // Validation
  if (!isValid) return;
  
  // Business logic
  performAction();
  
  // Callbacks
  onAction?.(result);
}, [dependencies]);
```

### 5. Render Props Pattern
```typescript
// Render props component for reusable logic
function DataProvider({ render, ...props }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data fetching logic
  useEffect(() => {
    fetchData().then(setData).finally(() => setLoading(false));
  }, []);
  
  return render({ data, loading, refetch: fetchData });
}

// Usage with complete UI control
<DataProvider
  render={({ data, loading }) => (
    loading ? <Spinner /> : <CustomDataDisplay data={data} />
  )}
/>

// Render props for resource interactions
<ResourceReactionable
  resource_type="ARTICLE"
  resource_id={articleId}
  render={({ reactions, toggle }) => (
    <div className="custom-reactions">
      {reactions.map(reaction => (
        <button key={reaction.type} onClick={() => toggle(reaction.type)}>
          {reaction.emoji} {reaction.count}
        </button>
      ))}
    </div>
  )}
/>
```

## Styling Conventions

### Tailwind CSS Usage
```typescript
// Container patterns
"flex items-center justify-between"
"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
"max-w-4xl mx-auto p-4"

// Interactive states
"hover:bg-primary/20 transition-colors duration-200"
"focus:outline-none focus:ring-2 focus:ring-primary"
"disabled:opacity-50 disabled:cursor-not-allowed"

// Responsive design
"hidden md:block"
"text-sm md:text-base"
"p-2 md:p-4"
```

### Component Styling Structure
```typescript
// Base classes
const baseClasses = "component-base-styles";

// Variant classes
const variantClasses = {
  primary: "primary-variant-styles",
  secondary: "secondary-variant-styles"
};

// State classes
const stateClasses = clsx(baseClasses, {
  [variantClasses[variant]]: variant,
  "active-state": isActive,
  "disabled-state": disabled
});
```

## Data Flow Patterns

### 1. Server State Management (React Query)
```typescript
// Data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', resourceId],
  queryFn: () => fetchResource(resourceId)
});

// Mutations
const mutation = useMutation({
  mutationFn: updateResource,
  onSuccess: () => queryClient.invalidateQueries(['resource'])
});
```

### 2. Client State Management (Jotai)
```typescript
// Global atoms
const [session, setSession] = useAtom(sessionAtom);
const [theme, setTheme] = useAtom(themeAtom);
const [language, setLanguage] = useAtom(languageAtom);
```

### 3. Form State Management (React Hook Form)
```typescript
const form = useForm({
  defaultValues: initialData,
  resolver: zodResolver(validationSchema)
});

const onSubmit = form.handleSubmit((data) => {
  // Handle form submission
});
```

## Accessibility Guidelines

### Semantic HTML
```typescript
// Use proper semantic elements
<article>
  <header>
    <h1>{title}</h1>
  </header>
  <main>{content}</main>
  <footer>{metadata}</footer>
</article>

// Navigation structures
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/home">Home</a></li>
  </ul>
</nav>
```

### ARIA Attributes
```typescript
// Interactive elements
<button
  aria-label={`Delete ${itemName}`}
  aria-describedby="delete-description"
  onClick={handleDelete}
>
  Delete
</button>

// Dynamic content
<div
  role="status"
  aria-live="polite"
  aria-label="Loading status"
>
  {isLoading ? "Loading..." : "Content loaded"}
</div>
```

### Focus Management
```typescript
// Focus trapping in modals
const focusRef = useRef<HTMLElement>(null);

useEffect(() => {
  if (isOpen && focusRef.current) {
    focusRef.current.focus();
  }
}, [isOpen]);

// Skip links for navigation
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

## Performance Best Practices

### Component Optimization
```typescript
// Memoization for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexVisualization data={data} />;
});

// Callback memoization
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);

// Value memoization
const processedData = useMemo(() => {
  return processLargeDataset(rawData);
}, [rawData]);
```

### Loading Strategies
```typescript
// Lazy loading for large components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Skeleton loading states
{isLoading ? (
  <SkeletonLoader />
) : (
  <ActualContent data={data} />
)}

// Progressive enhancement
<Suspense fallback={<Spinner />}>
  <LazyComponent />
</Suspense>
```

### Image Optimization
```typescript
// Proper image sizing
<AppImage
  imageSource={source}
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Descriptive alt text"
/>

// Lazy loading implementation
loading="lazy"
placeholder="blur"
blurDataURL={blurredVersion}
```

## Testing Strategies

### Component Testing
```typescript
// Basic rendering tests
test('renders component with required props', () => {
  render(<Component title="Test" />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});

// Interaction testing
test('handles user interactions', async () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  await user.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});

// Accessibility testing
test('is accessible', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Integration Testing
```typescript
// API integration
test('fetches and displays data', async () => {
  mockAPI.get('/api/data').mockResolvedValue({ data: testData });
  
  render(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText(testData.title)).toBeInTheDocument();
  });
});
```

## Internationalization (i18n)

### Translation Integration
```typescript
function Component() {
  const { _t } = useTranslation();
  
  return (
    <div>
      <h1>{_t("Welcome to TechDiary")}</h1>
      <p>{_t("User count: $", [userCount])}</p>
      <button>{_t("Get Started")}</button>
    </div>
  );
}
```

### Language-Aware Formatting
```typescript
// Date formatting
const { lang } = useTranslation();
const formattedDate = formattedTime(date, lang);

// Number formatting
const formattedNumber = new Intl.NumberFormat(lang).format(number);

// Currency formatting
const formattedPrice = new Intl.NumberFormat(lang, {
  style: 'currency',
  currency: 'USD'
}).format(price);
```

## Error Handling

### Error Boundaries
```typescript
class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### Graceful Degradation
```typescript
// Network error handling
{error ? (
  <div className="error-state">
    <p>Failed to load content</p>
    <button onClick={retry}>Try Again</button>
  </div>
) : (
  <MainContent />
)}

// Feature detection
{supportsFeature ? (
  <EnhancedComponent />
) : (
  <BasicComponent />
)}
```

## Contributing Guidelines

### Creating New Components

1. **Component Structure**
```typescript
// ComponentName.tsx
interface ComponentNameProps {
  // Define props interface
}

const ComponentName: React.FC<ComponentNameProps> = ({ 
  prop1, 
  prop2 
}) => {
  // Hooks
  // Event handlers
  // Render logic
  
  return (
    // JSX
  );
};

export default ComponentName;
```

2. **Documentation Template**
```markdown
# ComponentName

## Overview
Brief description of the component's purpose.

## Props
Interface definition with descriptions.

## Usage Examples
Practical examples of component usage.

## Features
Key functionality and capabilities.

## Best Practices
Usage recommendations and patterns.
```

3. **Testing Requirements**
- Unit tests for all props and states
- Integration tests for user interactions
- Accessibility tests
- Visual regression tests (if applicable)

### Code Review Checklist

- [ ] Component follows established patterns
- [ ] Props interface is properly typed
- [ ] Accessibility requirements met
- [ ] Performance optimizations applied
- [ ] Error handling implemented
- [ ] Documentation updated
- [ ] Tests written and passing
- [ ] Internationalization considered

## Architecture Decisions

### Component Organization
```
src/components/
├── ComponentName.tsx          # Main component
├── ComponentName.test.tsx     # Tests
├── ComponentName.stories.tsx  # Storybook stories
├── hooks/                     # Component-specific hooks
├── utils/                     # Component utilities
└── types/                     # Type definitions
```

### Naming Conventions
- **Components**: PascalCase (e.g., `ArticleCard`)
- **Props**: camelCase with descriptive names
- **Event handlers**: `onAction` pattern (e.g., `onUploadComplete`)
- **Boolean props**: `is` or `has` prefix (e.g., `isLoading`, `hasError`)

### Export Patterns
```typescript
// Default export for main component
export default ComponentName;

// Named exports for types and utilities
export type { ComponentNameProps };
export { componentUtility };
```

## Related Documentation

- [Hooks Documentation](../hooks/README.md) - Custom hooks used in components
- [Styling Guide](../styling/README.md) - CSS and design system guidelines
- [API Integration](../api/README.md) - Server state management patterns
- [Testing Guide](../testing/README.md) - Component testing strategies

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)