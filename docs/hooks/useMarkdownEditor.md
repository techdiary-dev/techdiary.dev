# useMarkdownEditor Hook

A custom hook that provides markdown editing commands for textarea elements, enabling rich text formatting through keyboard shortcuts and toolbar buttons.

## Location
`src/components/Editor/useMarkdownEditor.ts`

## Signature
```typescript
function useMarkdownEditor(options?: {
  value?: string;
  ref?: React.RefObject<HTMLTextAreaElement | null>;
  onChange?: (value: string) => void;
}): { executeCommand: (command: MarkdownCommand) => void } | undefined
```

## Parameters
- `options` (optional): Configuration object containing:
  - `value`: Current textarea value (not used in current implementation)
  - `ref`: React ref object pointing to the textarea element
  - `onChange`: Callback function to handle value changes

## Returns
- Object with `executeCommand` function, or `undefined` if no ref provided

## Supported Commands
- `"heading"`: Converts selected text to H2 heading (`## text`)
- `"bold"`: Wraps selected text with bold formatting (`**text**`)
- `"italic"`: Wraps selected text with italic formatting (`*text*`)
- `"image"`: Inserts image markdown template (`![alt text](image-url)`)

## Usage Example

```typescript
import { useMarkdownEditor } from '@/components/Editor/useMarkdownEditor';
import { useRef, useState } from 'react';

function MarkdownEditor() {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const editor = useMarkdownEditor({
    ref: textareaRef,
    onChange: setContent
  });

  const handleCommand = (command: string) => {
    if (editor) {
      editor.executeCommand(command as any);
    }
  };

  return (
    <div className="markdown-editor">
      <div className="toolbar">
        <button onClick={() => handleCommand('heading')}>
          Heading
        </button>
        <button onClick={() => handleCommand('bold')}>
          Bold
        </button>
        <button onClick={() => handleCommand('italic')}>
          Italic
        </button>
        <button onClick={() => handleCommand('image')}>
          Image
        </button>
      </div>
      
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your markdown here..."
        className="w-full h-64 p-4 border rounded"
      />
    </div>
  );
}
```

## Advanced Usage with Keyboard Shortcuts

```typescript
import { useMarkdownEditor } from '@/components/Editor/useMarkdownEditor';
import { useRef, useState, useCallback } from 'react';

function AdvancedMarkdownEditor() {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const editor = useMarkdownEditor({
    ref: textareaRef,
    onChange: setContent
  });

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!editor) return;

    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          editor.executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          editor.executeCommand('italic');
          break;
        case 'h':
          e.preventDefault();
          editor.executeCommand('heading');
          break;
      }
    }
  }, [editor]);

  return (
    <div>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+H for heading"
      />
    </div>
  );
}
```

## Command Details

### Heading Command
- Adds `## ` prefix to selected text
- Creates H2 level heading
- Works with text selection or cursor position

### Bold Command
- Wraps selected text with `**text**`
- Creates bold formatting in markdown
- If no text selected, wraps empty string

### Italic Command
- Wraps selected text with `*text*`
- Creates italic formatting in markdown
- If no text selected, wraps empty string

### Image Command
- Inserts `![alt text](image-url)` template
- Provides placeholder for alt text and URL
- Inserted at cursor position

## Features
- **Selection-aware**: Works with text selections or cursor position
- **Focus management**: Automatically returns focus to textarea after command
- **Callback integration**: Calls onChange callback with updated content
- **TypeScript support**: Fully typed command system
- **Real-time updates**: Immediately updates textarea content

## Implementation Details
- Uses `selectionStart` and `selectionEnd` to work with text selections
- Directly manipulates `textarea.value` for immediate visual feedback
- Calls `onChange` callback for state synchronization
- Returns focus to textarea after each command
- Requires ref to be provided, returns undefined otherwise

## Common Use Cases
- **Blog editors**: Rich text editing for articles
- **Comment systems**: Enhanced commenting with formatting
- **Documentation tools**: Writing documentation with markdown
- **Note-taking apps**: Enhanced note formatting
- **Code documentation**: README and code comment editing
- **Wiki systems**: Collaborative content editing

## Integration with Other Hooks

```typescript
// Combine with useAutosizeTextArea
const textareaRef = useRef<HTMLTextAreaElement>(null);
const editor = useMarkdownEditor({ ref: textareaRef, onChange: setContent });
useAutosizeTextArea(textareaRef, content);

// Combine with useDebouncedCallback for auto-save
const debouncedSave = useDebouncedCallback(saveContent, 1000);
const editor = useMarkdownEditor({ 
  ref: textareaRef, 
  onChange: (value) => {
    setContent(value);
    debouncedSave(value);
  }
});
```

## Extensibility
The hook can be extended to support additional markdown commands:
- Lists (ordered/unordered)
- Code blocks
- Links
- Strikethrough
- Blockquotes
- Tables

## Best Practices
- Always provide a ref to the textarea
- Use with controlled components for proper state management
- Combine with keyboard shortcuts for better UX
- Consider adding undo/redo functionality
- Test with various text selections and edge cases