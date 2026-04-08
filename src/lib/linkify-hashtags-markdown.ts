import {
  HASHTAG_MATCH_RE,
  slugifyHashtagRaw,
} from "@/lib/extract-hashtag-slugs";

function replaceHashtagsInPlainSegment(segment: string): string {
  const re = new RegExp(HASHTAG_MATCH_RE.source, HASHTAG_MATCH_RE.flags);
  return segment.replace(re, (full, raw: string) => {
    const slug = slugifyHashtagRaw(raw);
    if (!slug) return full;
    return `[${full}](/tags/${encodeURIComponent(slug)})`;
  });
}

/** Skip fenced ``` blocks (keep as-is). */
function linkifyOutsideCodeFences(markdown: string): string {
  const parts = markdown.split(/(```[\s\S]*?```)/g);
  return parts
    .map((chunk, i) => (i % 2 === 1 ? chunk : linkifyOutsideInlineCode(chunk)))
    .join("");
}

/** Skip single-line `inline code`. */
function linkifyOutsideInlineCode(segment: string): string {
  const pieces = segment.split(/(`[^`\n]+`)/g);
  return pieces
    .map((chunk, i) =>
      i % 2 === 1 ? chunk : replaceHashtagsInPlainSegment(chunk),
    )
    .join("");
}

/**
 * Turn hashtags in markdown into `/tags/{slug}` links before Markdoc runs.
 * Does not touch fenced or inline code.
 */
export function linkifyHashtagsForMarkdown(markdown: string): string {
  if (!markdown) return markdown;
  return linkifyOutsideCodeFences(markdown);
}
