# ArticleEditor Component

A comprehensive markdown editor for creating and editing articles with real-time preview, auto-save, and rich formatting tools.

## Location
`src/components/Editor/ArticleEditor.tsx`

## Overview
ArticleEditor is a full-featured article editing interface that provides markdown editing capabilities, real-time preview, auto-save functionality, and article management features.

## Props

```typescript
interface ArticleEditorProps {
  uuid?: string;
  article?: Article;
}
```

### Props Details
- `uuid`: Unique identifier for existing article (for editing mode)
- `article`: Article data object (for editing existing articles)

## Usage Examples

### Creating New Article
```typescript
import ArticleEditor from '@/components/Editor/ArticleEditor';

function NewArticlePage() {
  return (
    <div className="container mx-auto">
      <ArticleEditor />
    </div>
  );
}
```

### Editing Existing Article
```typescript
function EditArticlePage({ articleId }: { articleId: string }) {
  const { data: article } = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => fetchArticle(articleId)
  });

  if (!article) return <div>Loading...</div>;

  return (
    <ArticleEditor
      uuid={article.id}
      article={article}
    />
  );
}
```

## Key Features

### Real-time Editing
- **Auto-save**: Automatically saves changes after 1 second of inactivity
- **Debounced updates**: Prevents excessive API calls during typing
- **Live status**: Shows saving status and last saved time
- **Form validation**: Uses Zod schema validation

### Editor Modes
- **Write mode**: Markdown editing with toolbar
- **Preview mode**: Rendered markdown preview
- **Toggle switch**: Easy switching between modes

### Markdown Toolbar
- **Heading**: Insert H2 headings
- **Bold**: Bold text formatting
- **Italic**: Italic text formatting  
- **Image**: Insert image markdown

### Article Management
- **Publish/Unpublish**: Toggle article publication status
- **Draft indication**: Visual status indicators
- **Settings drawer**: Additional article configuration
- **Navigation**: Back to dashboard

## Component Structure

### Form Management
```typescript
const editorForm = useForm({
  defaultValues: {
    title: article?.title || "",
    body: article?.body || "",
  },
  resolver: zodResolver(ArticleRepositoryInput.updateArticleInput),
});
```

### Auto-save Implementation
```typescript
// Title auto-save (1 second delay)
const setDebouncedTitle = useDebouncedCallback(
  handleDebouncedSaveTitle,
  1000
);

// Body auto-save (1 second delay)
const setDebouncedBody = useDebouncedCallback(
  handleDebouncedSaveBody, 
  1000
);
```

### Markdown Editor Integration
```typescript
const editor = useMarkdownEditor({
  ref: bodyRef,
  onChange: handleBodyContentChange,
});
```

## Hooks Used

### Custom Hooks
- `useTranslation`: Internationalization
- `useToggle`: Modal and drawer state management
- `useAutosizeTextArea`: Auto-resizing title input
- `useDebouncedCallback`: Auto-save functionality
- `useMarkdownEditor`: Markdown formatting commands
- `useAppConfirm`: Confirmation dialogs

### React Query
- `useMutation`: Article creation and updates
- Optimistic updates and error handling

## Auto-save Behavior

### Title Auto-save
- Triggers after 1 second of no typing
- Creates new article if none exists
- Updates existing article title

### Body Auto-save
- Triggers after 1 second of no typing
- Creates article with default title if new
- Updates existing article content

### Save Status Display
```typescript
{updateMyArticleMutation.isPending ? (
  <p>{_t("Saving")}...</p>
) : (
  article?.updated_at && (
    <p>
      ({_t("Saved")} {formattedTime(article.updated_at, lang)})
    </p>
  )
)}
```

## Editor Toolbar

### Available Commands
```typescript
// Heading command
editor?.executeCommand("heading")

// Bold formatting
editor?.executeCommand("bold")

// Italic formatting  
editor?.executeCommand("italic")

// Image insertion
editor?.executeCommand("image")
```

### Toolbar Rendering
```typescript
const renderEditorToolbar = () => (
  <div className="flex w-full gap-6 p-2 my-2 bg-muted">
    <EditorCommandButton
      onClick={() => editor?.executeCommand("heading")}
      Icon={<HeadingIcon />}
    />
    <EditorCommandButton
      onClick={() => editor?.executeCommand("bold")}
      Icon={<FontBoldIcon />}
    />
    {/* ... more buttons */}
  </div>
);
```

## Preview Mode

### Markdown Rendering
```typescript
{editorMode === "write" ? (
  <textarea
    value={watchedBody}
    onChange={handleBodyContentChange}
    // ... props
  />
) : (
  <div className="content-typography">
    {markdocParser(watchedBody ?? "")}
  </div>
)}
```

## Article Management Features

### Publish Toggle
```typescript
const handlePublishToggle = useCallback(() => {
  appConfig.show({
    title: _t("Are you sure?"),
    onConfirm: () => {
      updateMyArticleMutation.mutate({
        article_id: uuid,
        is_published: !article?.is_published,
      });
    },
  });
}, [/* dependencies */]);
```

### Status Indicators
```typescript
<p className={clsx("px-2 py-1 text-foreground", {
  "bg-green-100": article?.is_published,
  "bg-red-100": !article?.is_published,
})}>
  {article?.is_published ? (
    <span className="text-success">{_t("Published")}</span>
  ) : (
    <span className="text-destructive">{_t("Draft")}</span>
  )}
</p>
```

## Responsive Design

### Mobile Optimizations
- Hidden preview/publish buttons on mobile
- Responsive toolbar layout
- Touch-friendly interface
- Adaptive spacing and sizing

### Desktop Features
- Full toolbar visibility
- Preview mode toggle
- Publish/unpublish controls
- Settings access

## Performance Optimizations

### Debounced Operations
- Title and body changes debounced to 1 second
- Prevents excessive API calls
- Maintains smooth editing experience

### Memoized Callbacks
- Event handlers memoized with useCallback
- Dependency arrays optimized
- Prevents unnecessary re-renders

### Form Optimization
- React Hook Form for efficient form management
- Minimal re-renders on value changes
- Proper validation integration

## Error Handling

### Mutation Error Handling
```typescript
onError: (err) => {
  console.error("Error creating article:", err);
  alert(
    err instanceof Error
      ? err.message
      : "Failed to create article. Please try again."
  );
}
```

### Navigation Safety
- Confirmation dialogs for destructive actions
- Auto-save prevents data loss
- Proper error state management

## Internationalization

The component supports multiple languages:
- All UI text is translatable
- Date formatting respects locale
- Error messages are localized
- Placeholder text is translated

## Integration with Other Components

### Child Components
- **ArticleEditorDrawer**: Article settings and metadata
- **EditorCommandButton**: Toolbar button component
- **useMarkdownEditor**: Markdown editing functionality

### External Dependencies
- **markdocParser**: Markdown to HTML conversion
- **React Hook Form**: Form state management
- **Zod**: Input validation
- **TanStack Query**: Server state management

## Best Practices

### Data Management
```typescript
// Always handle loading states
if (isLoading) return <LoadingSpinner />;

// Proper error boundaries
if (error) return <ErrorMessage error={error} />;

// Optimistic updates for better UX
onMutate: (variables) => {
  // Optimistically update UI
}
```

### User Experience
```typescript
// Prevent data loss with auto-save
const setDebouncedBody = useDebouncedCallback(saveContent, 1000);

// Provide visual feedback
{isSaving && <p>Saving...</p>}

// Confirm destructive actions
appConfirm.show({
  title: "Are you sure?",
  onConfirm: performAction
});
```

## Common Use Cases

### Blog Post Creation
```typescript
function CreateBlogPost() {
  return (
    <PageLayout>
      <ArticleEditor />
    </PageLayout>
  );
}
```

### Article Editing Workflow
```typescript
function EditWorkflow({ articleId }: { articleId: string }) {
  const { data: article, isLoading } = useArticle(articleId);
  
  if (isLoading) return <Skeleton />;
  
  return (
    <ArticleEditor
      uuid={articleId}
      article={article}
    />
  );
}
```

### Draft Management
```typescript
function DraftEditor({ draftId }: { draftId: string }) {
  const { data: draft } = useDraft(draftId);
  
  return (
    <ArticleEditor
      uuid={draftId}
      article={draft}
    />
  );
}
```