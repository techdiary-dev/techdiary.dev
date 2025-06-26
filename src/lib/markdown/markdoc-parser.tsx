import Markdoc from "@markdoc/markdoc";
import React from "react";
import { YoutubeTag, YoutubeTagConfig } from "./markdown-tags/youtube";
import { CodeTag, CodeTagConfig } from "./markdown-tags/code";

export const markdocParser = (markdown: string) => {
  const ast = Markdoc.parse(markdown);
  const content = Markdoc.transform(ast, {
    tags: {
      youtube: YoutubeTagConfig,
    },
    nodes: {
      fence: CodeTagConfig,
    },
  });

  return Markdoc.renderers.react(content, React, {
    components: {
      Youtube: YoutubeTag,
      Fence: CodeTag,
    },
  });
};
