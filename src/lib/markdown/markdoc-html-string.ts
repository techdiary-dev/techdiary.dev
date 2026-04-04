import Markdoc, { type Node, Tag } from "@markdoc/markdoc";
import { removeMarkdownSyntax } from "@/lib/utils";
import { parseMarkdocDocument } from "./markdoc-tokenizer";

function safeForCdata(html: string): string {
  return html.replace(/]]>/g, "]]]]><![CDATA[>");
}

function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;");
}

function escapeHtmlText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function featureImageMarkup(url: string, alt: string): string {
  return `<figure class="rss-feature-image"><img src="${escapeHtmlAttr(url)}" alt="${escapeHtmlAttr(alt)}" /></figure>`;
}

export type MarkdocRssOptions = {
  featureImageUrl?: string | null;
  featureImageAlt?: string;
};

/**
 * Renders article Markdoc to an HTML string for RSS (no React / react-dom/server).
 * Uses Markdoc’s HTML renderer; custom tags match site features where useful.
 */
export function markdocToHtmlForRss(
  body: string | null | undefined,
  opts?: MarkdocRssOptions,
): string {
  const md = body ?? "";
  const alt = opts?.featureImageAlt ?? "";
  const featureUrl = opts?.featureImageUrl?.trim();
  const prefix = featureUrl ? featureImageMarkup(featureUrl, alt) : "";

  try {
    const ast = parseMarkdocDocument(md);
    const content = Markdoc.transform(ast, {
      tags: {
        youtube: {
          attributes: {
            id: { type: String, required: true },
          },
          transform(node: Node) {
            return new Tag("iframe", {
              src: `https://www.youtube.com/embed/${node.attributes.id}`,
              width: "560",
              height: "315",
              title: "YouTube video",
              allow:
                "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
              allowfullscreen: "true",
            });
          },
        },
        livecode: {
          attributes: {
            template: { type: String, default: "react" },
            content: { type: String, required: true },
          },
          transform(node: Node) {
            return new Tag("pre", { class: "livecode-rss" }, [
              node.attributes.content as string,
            ]);
          },
        },
      },
    });
    return safeForCdata(prefix + Markdoc.renderers.html(content));
  } catch {
    const text = removeMarkdownSyntax(md, 200) ?? "";
    return safeForCdata(`${prefix}<p>${escapeHtmlText(text)}</p>`);
  }
}
