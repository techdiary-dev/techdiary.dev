"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import React from "react";

interface Props {
  template?: "react" | "vue" | "angular" | "svelte" | "vanilla";
  content: string;
}

export const LivecodeTag: React.FC<Props> = ({
  template = "react",
  content,
}) => {
  return (
    <div className="my-4">
      <Sandpack
        template={template}
        files={{
          "/App.tsx": {
            code: content,
            active: true,
          },
        }}
        options={{
          showTabs: true,
          showLineNumbers: true,
          showInlineErrors: true,
          wrapContent: true,
          editorHeight: 350,
        }}
        theme="dark"
      />
    </div>
  );
};

export const LivecodeTagConfig = {
  render: "LiveCode",
  children: ["inline", "text"],
  attributes: {
    template: {
      type: String,
      default: "react",
      options: ["react", "vue", "angular", "svelte", "vanilla"],
    },
    content: {
      type: String,
      required: true,
    },
  },
};

/*
{% livecode template="react" 
  files=[{"name":"App.tsx","content":"export default function App() {\n  return <h1>Hello, world!</h1>\n}"}]
/%}

*/
