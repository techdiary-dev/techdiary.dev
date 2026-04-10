---
title: Article writing — Markdown & Markdoc on TechDiary
---

# Article writing — Markdown & Markdoc on TechDiary

Articles on TechDiary are written in **Markdown** and parsed with [**Markdoc**](https://markdoc.dev/). Anything that works in standard Markdown (headings, lists, links, images, blockquotes, thematic breaks) generally works in the editor. This page documents **platform-specific behavior** and **custom Markdoc tags** (`{% … %}`).

This file lives in `src/content` and is published at [`/pages/article-writing-markdown-guidelines`](/pages/article-writing-markdown-guidelines) alongside other static Markdown pages.

---

## Plain URLs become links

Bare URLs in normal paragraph text are turned into clickable links automatically (you do not have to wrap them in `<>` or `[]()`).

```markdown
Read more at https://markdoc.dev/docs/getting-started
```

---

## Hashtags in articles

In published articles, hashtags in the body are converted to tag links **outside** fenced code blocks and **outside** inline `` `code` `` spans.

- Write `#react` or `#web-dev` in prose → links to `/tags/…` using the same slug rules as the rest of the site.
- `## Heading` is **not** treated as a hashtag (Markdown headings stay headings).
- Hashtags are not matched inside `` `inline code` `` or inside ` ``` ` fenced blocks.

Use letters, digits, underscores, and hyphens in the tag name after `#`; the first character after `#` must be a letter or digit.

---

## Code blocks (fenced)

Use triple backticks and an optional language identifier. The reader sees a highlighted block with a copy action.

````markdown
```typescript
const greeting: string = "TechDiary";
console.log(greeting);
```
````

If you omit the language, the highlighter defaults to **JavaScript**.

---

## Custom Markdoc tags

These use Markdoc’s tag syntax: `{% tagname attributes /%}` (self-closing) or a pair `{% tagname %} … {% /tagname %}` when the tag allows body content. Only the tags below are wired up for articles; other `{% … %}` constructs are not part of our supported authoring surface.

### YouTube embed

Pass the **YouTube video ID** (the `v=` value from the watch URL), not the full URL.

```markdown
{% youtube id="YOUR_VIDEO_ID" /%}
```

Example: for `https://www.youtube.com/watch?v=YOUR_VIDEO_ID`, use `id="YOUR_VIDEO_ID"`.

---

### Live code sandbox (Sandpack)

Embeds an interactive editor powered by [Sandpack](https://sandpack.codesandbox.io/). The code is supplied as the required **`content`** attribute (a single string). Use `\n` for line breaks inside the attribute.

**`template`** (optional): `react` (default), `vue`, `angular`, `svelte`, or `vanilla`.

**React example (minimal one-liner):**

```markdown
{% livecode template="react" content="export default function App() { return <h1>Hello from TechDiary</h1>; }" /%}
```

**React example (multiple lines via escapes):**

```markdown
{% livecode template="react" content="export default function App() {\n  return (\n    <main>\n      <h1>Hello</h1>\n      <p>Editable demo.</p>\n    </main>\n  );\n}" /%}
```

**Notes:**

- Double quotes inside JSX/strings in `content` must be escaped as `\"` inside the attribute.
- The live runner maps this to the main app file (e.g. `/App.tsx` for React). Unsupported or invalid `template` / `content` values may fail to render as expected.
- In RSS and other HTML fallbacks, the same `content` is exposed inside a `<pre class="livecode-rss">` block instead of the full sandbox.

---

## Quick reference

| Feature | Syntax / behavior |
|--------|-------------------|
| Heading | `#` … `######` |
| Bold / italic | `**bold**`, `*italic*` |
| Link | `[text](https://example.com)` |
| Image | `![alt text](https://example.com/image.png)` |
| Blockquote | `> quote` |
| Horizontal rule | `---` on its own line |
| Inline code | `` `code` `` |
| Fenced code | ` ```lang ` … ` ``` ` |
| YouTube | `{% youtube id="VIDEO_ID" /%}` |
| Live code | `{% livecode template="react" content="..." /%}` |
| Tag links | `#tagname` in prose (not in code) |

---

## Further reading

- [Markdoc syntax](https://markdoc.dev/docs/syntax)
- [CommonMark spec](https://commonmark.org/) (baseline Markdown behavior)
