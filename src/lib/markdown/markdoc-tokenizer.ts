import Markdoc from "@markdoc/markdoc";

/** Shared tokenizer: bare URLs (e.g. `https://…`) become real links, not plain text. */
const tokenizer = new Markdoc.Tokenizer({ linkify: true });

export function parseMarkdocDocument(markdown: string) {
  return Markdoc.parse(tokenizer.tokenize(markdown));
}
