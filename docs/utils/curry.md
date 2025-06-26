# curry

## Overview

The `curry` utility provides a sophisticated debounce function implementation with TypeScript support and advanced control methods. It helps optimize performance by limiting the frequency of function executions, particularly useful for search inputs, API calls, and event handlers.

## Location

`src/utils/curry.ts`

## API Reference

### `debounce<TArgs>`
```typescript
export const debounce = <TArgs extends any[]>(
  func: (...args: TArgs) => any,
  { delay = 500 }: { delay: number }
) => DebounceFunction<TArgs>
```

Creates a debounced version of the provided function that delays execution until after `delay` milliseconds have elapsed since the last invocation.

**Parameters:**
- `func`: The function to debounce
- `options.delay`: Delay in milliseconds (default: 500)

**Returns:** `DebounceFunction<TArgs>` with additional control methods

### `DebounceFunction<TArgs>`
```typescript
export type DebounceFunction<TArgs extends any[]> = {
  (...args: TArgs): void;
  cancel(): void;
  isPending(): boolean;
  flush(...args: TArgs): void;
};
```

Enhanced function type with control methods:
- `cancel()`: Cancels any pending invocation
- `isPending()`: Returns true if an invocation is pending
- `flush(...args)`: Immediately executes the debounced function

## Usage Examples

### Basic Debouncing
```typescript
import { debounce } from '@/utils/curry';

const handleSearch = debounce(
  (query: string) => {
    console.log('Searching for:', query);
    performSearch(query);
  },
  { delay: 300 }
);

// Usage in component
function SearchInput() {
  return (
    <input
      type="text"
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Advanced Control Methods
```typescript
import { debounce } from '@/utils/curry';

const debouncedSave = debounce(
  (data: FormData) => saveToServer(data),
  { delay: 1000 }
);

function AutoSaveForm() {
  const [formData, setFormData] = useState<FormData>({});
  
  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Auto-save with debounce
    debouncedSave(newData);
  };
  
  const handleSaveNow = () => {
    // Cancel pending save and save immediately
    debouncedSave.cancel();
    debouncedSave.flush(formData);
  };
  
  const handleDiscard = () => {
    // Cancel any pending saves
    debouncedSave.cancel();
    setFormData({});
  };
  
  return (
    <form>
      <input
        value={formData.title || ''}
        onChange={(e) => handleInputChange('title', e.target.value)}
      />
      <button type="button" onClick={handleSaveNow}>
        Save Now
      </button>
      <button type="button" onClick={handleDiscard}>
        Discard Changes
      </button>
      {debouncedSave.isPending() && (
        <span>Auto-saving...</span>
      )}
    </form>
  );
}
```

### API Request Debouncing
```typescript
import { debounce } from '@/utils/curry';

const debouncedAPICall = debounce(
  async (endpoint: string, params: Record<string, any>) => {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return response.json();
    } catch (error) {
      console.error('API call failed:', error);
    }
  },
  { delay: 500 }
);

function useAPIDebounce() {
  const callAPI = useCallback((endpoint: string, params: Record<string, any>) => {
    debouncedAPICall(endpoint, params);
  }, []);
  
  return {
    callAPI,
    cancel: debouncedAPICall.cancel,
    isPending: debouncedAPICall.isPending,
    flush: debouncedAPICall.flush
  };
}
```

### Event Handler Debouncing
```typescript
import { debounce } from '@/utils/curry';

function ResizableComponent() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const handleResize = debounce(
    () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    },
    { delay: 250 }
  );
  
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      handleResize.cancel(); // Cleanup pending calls
    };
  }, []);
  
  return (
    <div>
      Window size: {dimensions.width} x {dimensions.height}
    </div>
  );
}
```

## Advanced Patterns

### Multiple Debounce Instances
```typescript
import { debounce } from '@/utils/curry';

function MultiInputForm() {
  // Different delays for different inputs
  const debouncedValidation = debounce(
    (field: string, value: string) => validateField(field, value),
    { delay: 200 }
  );
  
  const debouncedSave = debounce(
    (formData: FormData) => saveForm(formData),
    { delay: 1000 }
  );
  
  const debouncedSearch = debounce(
    (query: string) => searchSuggestions(query),
    { delay: 300 }
  );
  
  return (
    <form>
      <input
        onChange={(e) => {
          debouncedValidation('title', e.target.value);
          debouncedSave(getFormData());
        }}
      />
      <input
        onChange={(e) => debouncedSearch(e.target.value)}
        placeholder="Search suggestions..."
      />
    </form>
  );
}
```

### Debounce with Custom Hook
```typescript
import { debounce } from '@/utils/curry';
import { useCallback, useRef, useEffect } from 'react';

function useDebounce<T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) {
  const callbackRef = useRef(callback);
  const debouncedRef = useRef<ReturnType<typeof debounce>>();
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Create debounced function
  const debouncedCallback = useCallback((...args: T) => {
    if (!debouncedRef.current) {
      debouncedRef.current = debounce(
        (...args: T) => callbackRef.current(...args),
        { delay }
      );
    }
    debouncedRef.current(...args);
  }, [delay]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedRef.current?.cancel();
    };
  }, []);
  
  return {
    callback: debouncedCallback,
    cancel: () => debouncedRef.current?.cancel(),
    flush: (...args: T) => debouncedRef.current?.flush(...args),
    isPending: () => debouncedRef.current?.isPending() || false
  };
}

// Usage
function Component() {
  const { callback: debouncedSave, isPending, cancel } = useDebounce(
    (data: string) => saveData(data),
    500
  );
  
  return (
    <div>
      <input onChange={(e) => debouncedSave(e.target.value)} />
      {isPending() && <span>Saving...</span>}
      <button onClick={cancel}>Cancel Save</button>
    </div>
  );
}
```

## Performance Characteristics

### Memory Usage
- **Minimal Overhead**: Single timer per debounced function
- **Automatic Cleanup**: Timer cleared after execution
- **No Memory Leaks**: Proper cleanup in cancel method

### Execution Timing
```typescript
const debouncedFn = debounce(fn, { delay: 1000 });

debouncedFn(); // Starts 1000ms timer
debouncedFn(); // Cancels previous, starts new 1000ms timer
debouncedFn(); // Cancels previous, starts new 1000ms timer
// Function executes once after 1000ms of inactivity
```

### Browser Performance Impact
- **Event Handler Optimization**: Reduces excessive event processing
- **API Call Reduction**: Prevents unnecessary network requests
- **UI Responsiveness**: Maintains smooth user interactions

## Common Use Cases

### Search Input Optimization
```typescript
const debouncedSearch = debounce(
  (query: string) => {
    if (query.length >= 2) {
      searchAPI(query);
    }
  },
  { delay: 300 }
);
```

### Form Auto-Save
```typescript
const debouncedAutoSave = debounce(
  (formData: FormData) => {
    localStorage.setItem('draft', JSON.stringify(formData));
  },
  { delay: 2000 }
);
```

### Scroll Event Handling
```typescript
const debouncedScrollHandler = debounce(
  () => {
    const scrollPosition = window.scrollY;
    updateScrollIndicator(scrollPosition);
  },
  { delay: 100 }
);
```

### Window Resize Handling
```typescript
const debouncedResizeHandler = debounce(
  () => {
    recalculateLayout();
    updateResponsiveComponents();
  },
  { delay: 250 }
);
```

## Error Handling

### Safe Execution
```typescript
const safeDebouncedFunction = debounce(
  (data: unknown) => {
    try {
      processData(data);
    } catch (error) {
      console.error('Debounced function error:', error);
      // Handle error appropriately
    }
  },
  { delay: 500 }
);
```

### Cleanup in Error Scenarios
```typescript
useEffect(() => {
  const debouncedFn = debounce(apiCall, { delay: 500 });
  
  // Setup event listeners
  element.addEventListener('input', debouncedFn);
  
  return () => {
    // Always cleanup, even if component unmounts due to error
    element.removeEventListener('input', debouncedFn);
    debouncedFn.cancel();
  };
}, []);
```

## Testing Strategies

### Unit Testing
```typescript
import { debounce } from '@/utils/curry';

describe('debounce', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  
  afterAll(() => {
    jest.useRealTimers();
  });
  
  test('delays function execution', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, { delay: 1000 });
    
    debouncedFn('test');
    expect(mockFn).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(1000);
    expect(mockFn).toHaveBeenCalledWith('test');
  });
  
  test('cancels previous invocations', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, { delay: 1000 });
    
    debouncedFn('first');
    debouncedFn('second');
    
    jest.advanceTimersByTime(1000);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('second');
  });
  
  test('flush executes immediately', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, { delay: 1000 });
    
    debouncedFn.flush('immediate');
    expect(mockFn).toHaveBeenCalledWith('immediate');
  });
  
  test('cancel prevents execution', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, { delay: 1000 });
    
    debouncedFn('test');
    debouncedFn.cancel();
    
    jest.advanceTimersByTime(1000);
    expect(mockFn).not.toHaveBeenCalled();
  });
  
  test('isPending returns correct status', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, { delay: 1000 });
    
    expect(debouncedFn.isPending()).toBe(false);
    
    debouncedFn('test');
    expect(debouncedFn.isPending()).toBe(true);
    
    jest.advanceTimersByTime(1000);
    expect(debouncedFn.isPending()).toBe(false);
  });
});
```

### Integration Testing
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { debounce } from '@/utils/curry';

test('debounced search input works correctly', async () => {
  const mockSearch = jest.fn();
  const debouncedSearch = debounce(mockSearch, { delay: 300 });
  
  function SearchComponent() {
    return (
      <input
        data-testid="search-input"
        onChange={(e) => debouncedSearch(e.target.value)}
      />
    );
  }
  
  render(<SearchComponent />);
  const input = screen.getByTestId('search-input');
  
  // Rapid typing
  fireEvent.change(input, { target: { value: 'a' } });
  fireEvent.change(input, { target: { value: 'ab' } });
  fireEvent.change(input, { target: { value: 'abc' } });
  
  // Should not have called search yet
  expect(mockSearch).not.toHaveBeenCalled();
  
  // Wait for debounce delay
  await waitFor(() => {
    expect(mockSearch).toHaveBeenCalledWith('abc');
  }, { timeout: 400 });
  
  // Should only be called once
  expect(mockSearch).toHaveBeenCalledTimes(1);
});
```

## Best Practices

### Choosing Delay Values
```typescript
// UI feedback: 100-200ms
const uiFeedbackDebounce = debounce(updateUI, { delay: 150 });

// Search/autocomplete: 200-400ms
const searchDebounce = debounce(search, { delay: 300 });

// Auto-save: 1000-3000ms
const autoSaveDebounce = debounce(save, { delay: 2000 });

// Network requests: 300-500ms
const apiDebounce = debounce(apiCall, { delay: 400 });
```

### Cleanup Patterns
```typescript
// Always cleanup in useEffect
useEffect(() => {
  const debouncedFn = debounce(handler, { delay: 500 });
  
  // Setup
  setupEventListener(debouncedFn);
  
  // Cleanup
  return () => {
    removeEventListener(debouncedFn);
    debouncedFn.cancel(); // Important: cancel pending calls
  };
}, []);
```

### TypeScript Best Practices
```typescript
// Generic function typing
const createDebouncedHandler = <T extends any[]>(
  handler: (...args: T) => void,
  delay: number
) => {
  return debounce(handler, { delay });
};

// Usage maintains type safety
const typedHandler = createDebouncedHandler(
  (id: string, data: UserData) => updateUser(id, data),
  500
);
```

## Related Documentation

- [Performance Optimization](../performance/README.md)
- [Event Handling Patterns](../patterns/event-handling.md)
- [Custom Hooks](../hooks/README.md)
- [API Integration](../api/README.md)

## Resources

- [Debouncing and Throttling Explained](https://css-tricks.com/debouncing-throttling-explained-examples/)
- [JavaScript Timers](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)