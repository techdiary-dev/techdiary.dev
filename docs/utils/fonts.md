# fonts

## Overview

The `fonts` utility provides Next.js local font configurations specifically optimized for Bengali typography support in the TechDiary application. It exports pre-configured font objects that ensure consistent and proper rendering of Bengali text across the application.

## Location

`src/utils/fonts.ts`

## Exports

### `fontBosonhoto`
```typescript
export const fontBosonhoto: LocalFont
```

Custom font configuration for the Boshonto typeface, used for decorative Bengali text styling.

**Font File**: `public/fonts/Boshonto.woff`  
**Weight**: Default (not specified)  
**Usage**: Decorative headers, special text elements

### `fontKohinoorBanglaLight`
```typescript
export const fontKohinoorBanglaLight: LocalFont
```

Light variant of Kohinoor Bangla font for subtle Bengali text display.

**Font File**: `public/fonts/KohinoorBangla-Light.woff`  
**Weight**: 300  
**Usage**: Secondary text, captions, metadata

### `fontKohinoorBanglaRegular`
```typescript
export const fontKohinoorBanglaRegular: LocalFont
```

Regular variant of Kohinoor Bangla font for standard Bengali text content.

**Font File**: `public/fonts/KohinoorBangla-Regular.woff`  
**Weight**: 400  
**Usage**: Body text, primary content, standard UI elements

## Usage Examples

### Basic Font Application
```typescript
import { fontKohinoorBanglaRegular } from '@/utils/fonts';

export default function BengaliContent() {
  return (
    <div className={fontKohinoorBanglaRegular.className}>
      আমাদের টেকডায়েরিতে স্বাগতম
    </div>
  );
}
```

### Multiple Font Variants
```typescript
import { 
  fontKohinoorBanglaRegular, 
  fontKohinoorBanglaLight,
  fontBosonhoto 
} from '@/utils/fonts';

export default function TypographyExample() {
  return (
    <article>
      <h1 className={fontBosonhoto.className}>
        টেকডায়েরি
      </h1>
      <p className={fontKohinoorBanglaRegular.className}>
        প্রযুক্তিবিদদের জন্য একটি বিশেষ প্ল্যাটফর্ম
      </p>
      <small className={fontKohinoorBanglaLight.className}>
        সর্বশেষ আপডেট: আজ
      </small>
    </article>
  );
}
```

### Conditional Font Loading
```typescript
import { fontKohinoorBanglaRegular } from '@/utils/fonts';
import { useTranslation } from '@/hooks/useTranslation';

export default function LocalizedText({ children }: { children: string }) {
  const { lang } = useTranslation();
  
  return (
    <span 
      className={lang === 'bn' ? fontKohinoorBanglaRegular.className : ''}
    >
      {children}
    </span>
  );
}
```

### CSS Variable Integration
```typescript
import { fontKohinoorBanglaRegular } from '@/utils/fonts';

export default function StyledComponent() {
  return (
    <div 
      className={fontKohinoorBanglaRegular.className}
      style={{
        '--font-size': '1.125rem',
        '--line-height': '1.6'
      } as React.CSSProperties}
    >
      Bengali content with custom styling
    </div>
  );
}
```

## Font Properties

### File Format
All fonts use the WOFF (Web Open Font Format) for optimal web delivery:
- **Compression**: Better compression than TTF/OTF
- **Browser Support**: Wide browser compatibility
- **Loading Performance**: Faster loading times
- **Quality**: Maintains font quality

### Font Weights Available
- **Light (300)**: `fontKohinoorBanglaLight`
- **Regular (400)**: `fontKohinoorBanglaRegular`
- **Decorative**: `fontBosonhoto` (weight not specified)

### Character Support
The Kohinoor Bangla family supports:
- Bengali (Bangla) Unicode range
- Latin characters for mixed content
- Common punctuation and symbols
- Proper conjunct character rendering

## Performance Considerations

### Font Loading Strategy
```typescript
// Fonts are loaded using Next.js `localFont`
// which provides automatic optimization:
// - Preloading of critical fonts
// - Font display swap for better UX
// - Automatic font subsetting
```

### Bundle Impact
- **File Sizes**: WOFF format provides optimal compression
- **Loading**: Next.js automatically optimizes font loading
- **Caching**: Fonts are cached efficiently by the browser

### Best Practices
```typescript
// ✅ Good: Apply fonts at component level
<div className={fontKohinoorBanglaRegular.className}>
  Bengali content
</div>

// ❌ Avoid: Inline font loading in components
const MyFont = localFont({ src: './font.woff' }); // Don't do this
```

## Internationalization Integration

### Language Detection
```typescript
import { fontKohinoorBanglaRegular } from '@/utils/fonts';
import { useTranslation } from '@/hooks/useTranslation';

function LanguageAwareText({ text }: { text: string }) {
  const { lang } = useTranslation();
  
  const fontClass = lang === 'bn' 
    ? fontKohinoorBanglaRegular.className 
    : '';
    
  return <span className={fontClass}>{text}</span>;
}
```

### Mixed Language Content
```typescript
function MixedLanguageContent() {
  return (
    <div>
      <span>Welcome to </span>
      <span className={fontKohinoorBanglaRegular.className}>
        টেকডায়েরি
      </span>
    </div>
  );
}
```

## Accessibility Considerations

### Font Size and Readability
```css
/* Ensure proper scaling for Bengali text */
.bengali-text {
  font-size: 1.125rem; /* Slightly larger for better Bengali readability */
  line-height: 1.6; /* Increased line height for conjunct characters */
}
```

### Contrast and Visibility
```typescript
// Ensure adequate contrast with Bengali fonts
const BengaliText = ({ children }: { children: string }) => (
  <span 
    className={`${fontKohinoorBanglaRegular.className} text-gray-900 dark:text-gray-100`}
  >
    {children}
  </span>
);
```

## Browser Compatibility

### Fallback Strategy
```css
/* CSS fallbacks are automatically handled by Next.js */
font-family: 'Kohinoor Bangla', 'Noto Sans Bengali', sans-serif;
```

### Font Feature Support
```typescript
// Enable proper Bengali text rendering features
const bengaliTextStyle = {
  fontFeatureSettings: '"liga" 1, "calt" 1', // Enable ligatures
  fontVariantLigatures: 'common-ligatures'
} as React.CSSProperties;
```

## Development Notes

### Font File Management
- Font files are stored in `public/fonts/`
- WOFF format ensures broad compatibility
- Files are version-controlled for consistency

### Updates and Maintenance
- Font updates require replacing WOFF files
- Consider impact on existing designs when updating
- Test Bengali rendering after font changes

### Testing Considerations
```typescript
// Test Bengali text rendering
test('renders Bengali text with correct font', () => {
  render(
    <div className={fontKohinoorBanglaRegular.className}>
      বাংলা টেক্সট
    </div>
  );
  
  const element = screen.getByText('বাংলা টেক্সট');
  expect(element).toHaveClass(fontKohinoorBanglaRegular.className);
});
```

## Common Issues and Solutions

### Font Loading Delays
```typescript
// Use font-display: swap for better UX
// (automatically handled by Next.js localFont)

// For critical text, consider preloading
<link
  rel="preload"
  href="/fonts/KohinoorBangla-Regular.woff"
  as="font"
  type="font/woff"
  crossOrigin=""
/>
```

### Bengali Text Rendering Issues
```css
/* Ensure proper text rendering */
.bengali-content {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Mixed Content Alignment
```css
/* Align mixed Bengali/English content */
.mixed-content {
  vertical-align: baseline;
  line-height: 1.6; /* Accommodate Bengali character height */
}
```

## Related Documentation

- [Typography Guidelines](../design/typography.md)
- [Internationalization](../i18n/README.md)
- [Performance Optimization](../performance/fonts.md)
- [Accessibility Standards](../accessibility/typography.md)

## Resources

- [Next.js Font Optimization](https://nextjs.org/docs/basic-features/font-optimization)
- [Kohinoor Bangla Font Family](https://fonts.google.com/specimen/Kohinoor+Bangla)
- [Bengali Typography Best Practices](https://bengali-typography.com/)
- [WOFF Font Format Specification](https://www.w3.org/TR/WOFF/)