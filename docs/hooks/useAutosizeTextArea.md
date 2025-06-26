# useAutosizeTextArea Hook

A custom hook that automatically resizes a textarea element to fit its content, eliminating the need for manual scrolling.

## Location
`src/hooks/use-auto-resize-textarea.ts`

## Signature
```typescript
function useAutosizeTextArea(
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>,
  value: string,
  initialHeight?: string
): void
```

## Parameters
- `textAreaRef`: React ref object pointing to the textarea element
- `value`: Current text content of the textarea (triggers resize when changed)
- `initialHeight` (optional): Initial height to set before auto-sizing

## Returns
None (void) - This hook has side effects on the referenced textarea

## Usage Example

```typescript
import { useAutosizeTextArea } from '@/hooks/use-auto-resize-textarea';
import { useRef, useState } from 'react';

function AutoResizeTextarea() {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useAutosizeTextArea(textareaRef, text);

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Start typing... The textarea will auto-resize!"
      style={{ minHeight: '40px', resize: 'none' }}
    />
  );
}
```

## Usage with Initial Height

```typescript
import { useAutosizeTextArea } from '@/hooks/use-auto-resize-textarea';
import { useRef, useState } from 'react';

function CommentBox() {
  const [comment, setComment] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Set initial height and auto-resize
  useAutosizeTextArea(textareaRef, comment, '60px');

  return (
    <div className="comment-box">
      <textarea
        ref={textareaRef}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your comment..."
        className="w-full border rounded p-2"
      />
    </div>
  );
}
```

## Features
- **Automatic resizing**: Adjusts height based on content
- **Initial height support**: Can set a starting height before auto-sizing
- **Performance optimized**: Only recalculates when value changes
- **No external dependencies**: Uses native DOM properties
- **Smooth resizing**: Provides smooth visual transitions

## Implementation Details
- **Trigger**: Runs whenever `value`, `textAreaRef`, or `initialHeight` changes
- **Reset method**: Sets height to 'auto' or initial height first
- **Calculation**: Uses `scrollHeight` property to determine required height
- **Safety check**: Verifies textarea exists before attempting to resize

## CSS Recommendations

```css
.auto-resize-textarea {
  resize: none; /* Disable manual resize */
  overflow: hidden; /* Hide scrollbars */
  min-height: 40px; /* Set minimum height */
  transition: height 0.1s ease; /* Smooth height transitions */
}
```

## Common Use Cases
- **Comment boxes**: Auto-expanding comment inputs
- **Message composition**: Chat message inputs that grow with content
- **Note-taking**: Text areas for notes that expand as user types
- **Form fields**: Multi-line form inputs with dynamic sizing
- **Code editors**: Simple code input areas
- **Rich text areas**: Foundation for rich text editors

## Best Practices
- Always set `resize: none` in CSS to prevent manual resizing conflicts
- Set a reasonable `min-height` to prevent textarea from becoming too small
- Consider setting a `max-height` with `overflow-y: auto` for very long content
- Use with controlled components (useState) for proper value tracking
- Test with various content types (short text, long paragraphs, line breaks)

## Styling Tips
```css
/* Recommended base styles */
.autosize-textarea {
  resize: none;
  overflow: hidden;
  min-height: 2.5rem;
  max-height: 300px; /* Optional: prevent excessive height */
  transition: height 0.15s ease;
  box-sizing: border-box;
}

/* When max-height is reached, show scrollbar */
.autosize-textarea.max-height-reached {
  overflow-y: auto;
}
```

## Accessibility Considerations
- Maintains all standard textarea accessibility features
- Screen readers work normally with auto-resizing textareas
- Focus behavior remains unchanged
- Keyboard navigation is unaffected

## Performance Notes
- Very lightweight - no expensive calculations
- Uses native DOM properties for optimal performance
- Effect only runs when dependencies change
- No polling or continuous monitoring required