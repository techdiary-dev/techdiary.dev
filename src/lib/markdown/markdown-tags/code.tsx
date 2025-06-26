"use client";

import { useTranslation } from "@/i18n/use-translation";
import { Clipboard } from "lucide-react";
import React, { PropsWithChildren, useTransition } from "react";
import toast from "react-hot-toast";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  language: string;
  children: string;
}

export const CodeTag: React.FC<Props> = (props) => {
  const { _t } = useTranslation();
  return (
    <>
      <div className="my-4 relative group">
        <button
          className="absolute top-1 right-4 flex gap-1 items-center group-hover:opacity-100 opacity-0 transform duration-300 rounded-md bg-slate-700 px-4 cursor-copy"
          onClick={() => {
            navigator.clipboard.writeText(props.children);
            toast.success(_t("Code copied"));
          }}
        >
          <Clipboard className="size-4" />
          {_t("Copy")}
        </button>
        <SyntaxHighlighter
          language={props.language ?? "js"}
          style={vscDarkPlus}
          customStyle={{
            borderRadius: "8px",
            fontSize: "14px",
            padding: "16px",
            lineHeight: "1.6",
          }}
          wrapLines={true}
        >
          {props.children}
        </SyntaxHighlighter>
      </div>
    </>
  );
};

export const CodeTagConfig = {
  render: "Fence",
  attributes: {
    language: {
      type: String,
      default: "javascript",
    },
  },
};
