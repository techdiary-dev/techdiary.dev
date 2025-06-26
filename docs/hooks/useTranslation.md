# useTranslation Hook

A custom hook for internationalization (i18n) that provides translation functionality with support for Bengali and English languages.

## Location
`src/i18n/use-translation.ts`

## Signature
```typescript
function useTranslation(): {
  _t: (key: string, placeholderValues?: (string | number)[]) => string;
  lang: string;
  toggle: () => Promise<void>;
}
```

## Parameters
None

## Returns
An object containing:
- `_t`: Translation function that returns localized text
- `lang`: Current language code ("en" or "bn")
- `toggle`: Function to switch between languages

## Usage Example

```typescript
import { useTranslation } from '@/i18n/use-translation';

function MyComponent() {
  const { _t, lang, toggle } = useTranslation();

  return (
    <div>
      <h1>{_t("Welcome")}</h1>
      <p>{_t("Current language")}: {lang}</p>
      <button onClick={toggle}>
        {_t("Switch Language")}
      </button>
    </div>
  );
}
```

## Translation Function (_t)

### Basic Translation
```typescript
const { _t } = useTranslation();

// Simple translation
const greeting = _t("Hello"); // Returns "Hello" in English or Bengali equivalent

// If translation key doesn't exist, returns the key itself
const missing = _t("NonExistentKey"); // Returns "NonExistentKey"
```

### Translation with Placeholders
```typescript
const { _t } = useTranslation();

// Single placeholder
const message = _t("Welcome back, $", ["John"]);
// Results in: "Welcome back, John"

// Multiple placeholders
const info = _t("You have $ new messages and $ notifications", [5, 3]);
// Results in: "You have 5 new messages and 3 notifications"

// Numeric placeholders
const count = _t("Items: $", [42]);
// Results in: "Items: 42"
```

## Language Management

### Current Language
```typescript
const { lang } = useTranslation();

console.log(lang); // "en" or "bn"

// Conditional rendering based on language
const isEnglish = lang === "en";
const isBengali = lang === "bn";
```

### Language Toggle
```typescript
const { toggle, lang } = useTranslation();

const handleLanguageSwitch = async () => {
  await toggle(); // Switches between "en" and "bn"
  console.log('Language switched');
};

// Toggle button
<button onClick={toggle}>
  {lang === "en" ? "বাংলা" : "English"}
</button>
```

## Advanced Usage Examples

### Component with Dynamic Content
```typescript
function UserProfile({ user }: { user: User }) {
  const { _t } = useTranslation();

  return (
    <div>
      <h2>{_t("User Profile")}</h2>
      <p>{_t("Name")}: {user.name}</p>
      <p>{_t("Email")}: {user.email}</p>
      <p>{_t("Member since $", [user.joinDate])}</p>
    </div>
  );
}
```

### Form with Validation Messages
```typescript
function ContactForm() {
  const { _t } = useTranslation();
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (formData: FormData) => {
    const newErrors = [];
    
    if (!formData.email) {
      newErrors.push(_t("Email is required"));
    }
    
    if (!formData.message) {
      newErrors.push(_t("Message cannot be empty"));
    }
    
    setErrors(newErrors);
  };

  return (
    <form>
      <input placeholder={_t("Enter your email")} />
      <textarea placeholder={_t("Your message")} />
      <button>{_t("Send Message")}</button>
      
      {errors.map((error, index) => (
        <p key={index} className="error">{error}</p>
      ))}
    </form>
  );
}
```

### Navigation with Localized Links
```typescript
function Navigation() {
  const { _t } = useTranslation();

  return (
    <nav>
      <Link href="/">{_t("Home")}</Link>
      <Link href="/articles">{_t("Articles")}</Link>
      <Link href="/about">{_t("About")}</Link>
      <Link href="/contact">{_t("Contact")}</Link>
    </nav>
  );
}
```

## Implementation Details
- **State Management**: Uses Jotai atom (`i18nLangAtom`) for global language state
- **Fallback**: Returns the key itself if translation is not found
- **Placeholder Replacement**: Uses simple string replacement with `$` symbol
- **Server Action**: Calls `setLanguage` server action for persistence
- **Default Language**: Falls back to English ("en") if no language is set

## Supported Languages
- **English**: "en" (default)
- **Bengali**: "bn"

## Translation Dictionary
Translations are stored in:
- `src/i18n/bn.json` - Bengali translations
- English uses the key itself as translation

## Placeholder System
- Uses `$` as placeholder marker
- Replaces placeholders sequentially with provided values
- Supports both string and numeric values
- Multiple placeholders supported in order

## Features
- **Automatic fallback**: Returns key if translation missing
- **Type safety**: Fully typed with TypeScript
- **Global state**: Language preference shared across app
- **Server persistence**: Language choice saved server-side
- **Flexible placeholders**: Support for dynamic content
- **Simple API**: Easy-to-use translation function

## Common Use Cases
- **UI Text**: Translate buttons, labels, headings
- **Form Messages**: Validation errors and success messages
- **Navigation**: Menu items and page titles
- **Dynamic Content**: User-generated content with placeholders
- **Error Messages**: System and API error messages
- **Notifications**: Alert and confirmation messages

## Best Practices
- Use descriptive translation keys
- Keep placeholder count minimal
- Test with both languages
- Consider text length differences between languages
- Use consistent key naming conventions
- Provide fallbacks for missing translations

## Performance Considerations
- Uses Jotai for efficient state management
- Translation lookup is O(1) operation
- Minimal re-renders when language changes
- Server action called only on language toggle
- Dictionary loaded only when needed

## File Structure
```
src/i18n/
├── use-translation.ts     # Main hook
├── bn.json               # Bengali translations
├── i18n.server-action.ts # Server-side language persistence
└── _t.ts                 # Translation types (if exists)
```

## Integration with Other Hooks
```typescript
// With useAppAlert
const { show } = useAppAlert();
const { _t } = useTranslation();

show({
  title: _t("Error"),
  description: _t("Something went wrong"),
  type: "error"
});

// With useAppConfirm
const { show } = useAppConfirm();
const { _t } = useTranslation();

show({
  title: _t("Confirm Delete"),
  children: <p>{_t("This action cannot be undone")}</p>,
  labels: {
    confirm: _t("Delete"),
    cancel: _t("Cancel")
  }
});
```