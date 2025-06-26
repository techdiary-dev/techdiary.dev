# Utils Documentation

This directory contains comprehensive documentation for all utility functions and shared functionality used throughout the TechDiary application.

## Overview

Utilities are pure functions and shared helpers that provide common functionality across components, services, and other parts of the application. They are designed to be reusable, testable, and framework-agnostic where possible.

## Available Utilities

### Core Utilities
- **[fonts](./fonts.md)** - Font configuration and Bengali typography support
- **[curry](./curry.md)** - Debounce utility for performance optimization
- **[getFileUrl](./getFileUrl.md)** - Multi-provider file URL generation and optimization

### Content Processing
- **[markdoc-parser](./markdoc-parser.md)** - Markdown parsing with custom components
- **[markdown-tags](./markdown-tags.md)** - React components for Markdoc integration

## Quick Reference

| Utility | Purpose | Key Features |
|---------|---------|--------------|
| `fonts` | Typography | Bengali font loading, Kohinoor Bangla variants |
| `curry` | Performance | Debounce with cancel/flush, TypeScript support |
| `getFileUrl` | Media | Multi-provider URLs, auto-optimization |
| `markdoc-parser` | Content | Markdown to React, custom tags |
| `markdown-tags` | Components | Interactive Markdoc components |

## Common Patterns

### 1. Font Usage Pattern
```typescript
import { fontKohinoorBanglaRegular } from '@/utils/fonts';

<div className={fontKohinoorBanglaRegular.className}>
  Bengali content with proper typography
</div>
```

### 2. Debounce Pattern
```typescript
import { debounce } from '@/utils/curry';

const debouncedSearch = debounce(
  (query: string) => performSearch(query),
  { delay: 300 }
);

// Use throughout component lifecycle
debouncedSearch('search term');
debouncedSearch.cancel(); // Cancel if needed
```

### 3. File URL Generation Pattern
```typescript
import getFileUrl from '@/utils/getFileUrl';

// Automatic provider detection and optimization
const optimizedUrl = getFileUrl({
  provider: 'cloudinary',
  key: 'image-public-id'
});
```

### 4. Content Parsing Pattern
```typescript
import { markdocParser } from '@/utils/markdoc-parser';

const richContent = markdocParser(`
# Title
{% callout type="note" title="Important" %}
Custom content with interactive components
{% /callout %}
`);
```

## Design Principles

### 1. Pure Functions
```typescript
// Predictable input/output
export const processData = (input: DataType): ProcessedData => {
  // No side effects
  return transformedData;
};
```

### 2. Type Safety
```typescript
// Comprehensive TypeScript interfaces
export interface UtilityOptions {
  required: string;
  optional?: boolean;
}

export const utility = <T>(
  input: T,
  options: UtilityOptions
): ProcessedResult<T> => {
  // Type-safe implementation
};
```

### 3. Error Handling
```typescript
// Graceful error handling with fallbacks
export const safeUtility = (input: unknown): Result => {
  try {
    return processInput(input);
  } catch (error) {
    console.warn('Utility error:', error);
    return fallbackValue;
  }
};
```

### 4. Configuration-Driven
```typescript
// Configurable behavior
export const configurableUtil = (
  input: Input,
  config: Config = defaultConfig
): Output => {
  return processWithConfig(input, { ...defaultConfig, ...config });
};
```

## Performance Considerations

### Memory Management
- Utilities avoid memory leaks through proper cleanup
- Debounce functions include cancellation mechanisms
- Large data processing uses streaming where applicable

### Optimization Strategies
- Memoization for expensive calculations
- Lazy loading for heavy dependencies
- Tree-shaking friendly exports

### Bundle Size Impact
```typescript
// Tree-shakeable exports
export { specificUtility } from './specific-module';

// Avoid barrel exports for large utilities
// import { heavyUtil } from './heavy-utils'; // ❌
import { heavyUtil } from './heavy-utils/heavy-util'; // ✅
```

## Testing Strategies

### Unit Testing Pattern
```typescript
describe('utilityFunction', () => {
  it('handles valid input correctly', () => {
    const result = utilityFunction(validInput);
    expect(result).toEqual(expectedOutput);
  });

  it('handles edge cases gracefully', () => {
    const result = utilityFunction(edgeCase);
    expect(result).toBeDefined();
  });

  it('throws appropriate errors for invalid input', () => {
    expect(() => utilityFunction(invalidInput)).toThrow();
  });
});
```

### Integration Testing
```typescript
// Test utilities in realistic scenarios
describe('utility integration', () => {
  it('works with real component data', () => {
    const componentData = getTestComponentData();
    const result = processComponentData(componentData);
    expect(result).toMatchSnapshot();
  });
});
```

## Environment Integration

### Environment Variables
```typescript
// Type-safe environment access
import { env } from '@/env';

export const getCloudinaryUrl = (publicId: string) => {
  return `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
};
```

### Provider Configuration
```typescript
// Multi-provider support with fallbacks
const providers = {
  cloudinary: CloudinaryProvider,
  r2: R2Provider,
  local: LocalProvider
};

export const getProvider = (type: ProviderType) => {
  return providers[type] || providers.local;
};
```

## Internationalization Support

### Language-Aware Utilities
```typescript
// Utilities that respect current language
export const formatContent = (content: string, lang: Language) => {
  const formatter = getFormatterForLanguage(lang);
  return formatter.format(content);
};
```

### Text Processing
```typescript
// Bengali text processing utilities
export const processBengaliText = (text: string): ProcessedText => {
  return {
    normalized: normalizeBengaliText(text),
    wordCount: getBengaliWordCount(text),
    readingTime: calculateBengaliReadingTime(text)
  };
};
```

## Security Considerations

### Input Sanitization
```typescript
// Sanitize user input before processing
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: []
  });
};
```

### URL Validation
```typescript
// Validate URLs before processing
export const validateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};
```

## Browser Compatibility

### Feature Detection
```typescript
// Graceful degradation for browser features
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').indexOf('webp') > -1;
};
```

### Polyfill Integration
```typescript
// Conditional polyfill loading
export const ensureIntersectionObserver = async (): Promise<void> => {
  if (!('IntersectionObserver' in window)) {
    await import('intersection-observer');
  }
};
```

## Contributing Guidelines

### Creating New Utilities

1. **Function Signature**
```typescript
// Clear, descriptive function signature
export const descriptiveUtilityName = (
  primaryInput: PrimaryType,
  options: UtilityOptions = {}
): ReturnType => {
  // Implementation
};
```

2. **Documentation Template**
```markdown
# UtilityName

## Overview
Brief description of utility purpose and use cases.

## API Reference
Function signatures, parameters, and return types.

## Usage Examples
Practical examples with common scenarios.

## Performance Notes
Performance characteristics and optimization tips.
```

3. **Testing Requirements**
- Unit tests for all code paths
- Edge case handling tests
- Performance benchmarks for critical utilities
- Browser compatibility tests where applicable

### Code Review Checklist

- [ ] Function is pure (no side effects)
- [ ] Comprehensive TypeScript typing
- [ ] Error handling implemented
- [ ] Performance optimized
- [ ] Browser compatibility considered
- [ ] Security implications reviewed
- [ ] Documentation complete
- [ ] Tests written and passing

## Related Documentation

- [Components Documentation](../components/README.md) - Components that use these utilities
- [Hooks Documentation](../hooks/README.md) - Custom hooks that may wrap utilities
- [API Documentation](../api/README.md) - Server-side utility usage
- [Performance Guide](../performance/README.md) - Performance optimization strategies

## Migration Guide

### Updating Utilities
When updating existing utilities, consider:

1. **Backward Compatibility**
```typescript
// Maintain old signature while adding new features
export const utility = (
  input: Input,
  optionsOrLegacyParam?: Options | LegacyType
): Output => {
  // Handle both old and new signatures
  const options = isLegacyParam(optionsOrLegacyParam) 
    ? convertLegacyOptions(optionsOrLegacyParam)
    : optionsOrLegacyParam || {};
  
  // Implementation
};
```

2. **Deprecation Strategy**
```typescript
// Clear deprecation warnings
export const oldUtility = (input: Input): Output => {
  console.warn('oldUtility is deprecated. Use newUtility instead.');
  return newUtility(input);
};
```

3. **Migration Path Documentation**
```markdown
## Migration from v1 to v2

### Breaking Changes
- Function signature changed from `old(a, b)` to `new({ a, b })`
- Return type now includes additional metadata

### Migration Example
```typescript
// Old
const result = oldFunction(param1, param2);

// New  
const result = newFunction({ param1, param2 });
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JavaScript Performance Best Practices](https://web.dev/fast/)
- [Web API Documentation](https://developer.mozilla.org/en-US/docs/Web/API)
- [Next.js Utilities](https://nextjs.org/docs/basic-features/utilities)