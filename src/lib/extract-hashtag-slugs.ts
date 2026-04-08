import { slugify } from "@/lib/slug-helper.util";

/**
 * Match #tags in prose. Excludes: `##` headings (second #), `foo#bar`, `[#x]` / `(#x)` fragments, letters/digits/_ before #.
 */
export const HASHTAG_MATCH_RE =
  /(?<![#(\[\p{L}\p{N}_])#([\p{L}\p{N}][\p{L}\p{N}_-]*)/gu;

const TAG_NAME_MAX = 50;

export function slugifyHashtagRaw(raw: string): string | null {
  const slug = slugify(raw).slice(0, TAG_NAME_MAX);
  return slug || null;
}

/**
 * Ordered unique tag slugs from markdown/plain body, same rules as creatable tags in the editor (slugify).
 */
export function extractHashtagSlugsFromBody(body: string): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  const re = new RegExp(HASHTAG_MATCH_RE.source, HASHTAG_MATCH_RE.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const raw = m[1];
    if (!raw) continue;
    const slug = slugifyHashtagRaw(raw);
    if (!slug) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);
    ordered.push(slug);
  }
  return ordered;
}
