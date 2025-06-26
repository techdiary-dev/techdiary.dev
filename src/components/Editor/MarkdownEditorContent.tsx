"use client";

import { useTranslation } from "@/i18n/use-translation";
import {
  FontBoldIcon,
  FontItalicIcon,
  HeadingIcon,
  Link2Icon,
  UploadIcon,
} from "@radix-ui/react-icons";
import { Loader } from "lucide-react";
import React from "react";
import EditorCommandButton from "./EditorCommandButton";
import { useMarkdownEditor } from "./useMarkdownEditor";

interface MarkdownEditorContentProps {
  bodyRef: React.RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
}

export function MarkdownEditorContent({
  bodyRef,
  onChange,
}: MarkdownEditorContentProps) {
  const { _t } = useTranslation();
  const editor = useMarkdownEditor({
    ref: bodyRef,
    onChange,
  });

  const renderEditorToolbar = () => (
    <div className="flex w-full gap-6 p-2 my-2 bg-muted">
      <EditorCommandButton
        onClick={() => editor?.executeCommand("heading")}
        Icon={<HeadingIcon />}
        title="Heading (Ctrl/Cmd + H)"
      />
      <EditorCommandButton
        onClick={() => editor?.executeCommand("bold")}
        Icon={<FontBoldIcon />}
        title="Bold (Ctrl/Cmd + B)"
      />
      <EditorCommandButton
        onClick={() => editor?.executeCommand("italic")}
        Icon={<FontItalicIcon />}
        title="Italic (Ctrl/Cmd + I)"
      />
      <EditorCommandButton
        onClick={() => editor?.executeCommand("link")}
        Icon={<Link2Icon />}
        title="Link (Ctrl/Cmd + K)"
      />
      <EditorCommandButton
        onClick={() => editor?.executeCommand("upload-image")}
        Icon={
          editor?.isUploading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <UploadIcon />
          )
        }
        title="Upload Image (Ctrl/Cmd + U)"
        isDisabled={editor?.isUploading}
      />

      {editor?.isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin" />
          <span>{_t("Uploading image")}...</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col justify-between">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {renderEditorToolbar()}

        <div className="text-xs text-muted-foreground mt-2 md:mt-0 md:ml-4">
          {_t("Tip: Drag & drop or paste images directly into the editor")}
        </div>
      </div>
    </div>
  );
}
