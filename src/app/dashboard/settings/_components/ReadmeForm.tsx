"use client";

import { User } from "@/backend/models/domain-models";
import { UserActionInput } from "@/backend/services/inputs/user.input";
import * as userActions from "@/backend/services/user.action";
import EditorCommandButton from "@/components/Editor/EditorCommandButton";
import { MarkdownEditorProvider } from "@/components/Editor/MarkdownEditorProvider";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/use-translation";
import Markdown from "@/lib/markdown/Markdown";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FontBoldIcon,
  FontItalicIcon,
  HeadingIcon,
} from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { Loader } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod/v4";

interface Props {
  user: User;
}

const ReadmeForm: React.FC<Props> = ({ user }) => {
  const { _t } = useTranslation();
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");
  const editorRef = React.useRef<HTMLTextAreaElement>(null);

  const mutation = useMutation({
    mutationFn: (
      payload: z.infer<typeof UserActionInput.updateMyProfileInput>
    ) => userActions.updateMyProfile(payload),
    onSuccess: () => {
      toast.success(_t("Profile readme updated successfully"));
    },
    onError: (error) => {
      toast.error(_t("Failed to update profile readme"));
      console.error("Error updating profile readme:", error);
    },
  });

  const form = useForm({
    mode: "all",
    defaultValues: {
      profile_readme: user?.profile_readme || "",
    },
    resolver: zodResolver(UserActionInput.updateMyProfileInput),
  });

  const handleBodyContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement> | string) => {
      const value = typeof e === "string" ? e : e.target.value;
      form.setValue("profile_readme", value);
    },
    [form]
  );

  const toggleEditorMode = useCallback(
    () => setEditorMode((mode) => (mode === "write" ? "preview" : "write")),
    []
  );

  const executeCommand = useCallback((command: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    let newText = "";
    let newStart = start;
    let newEnd = end;

    switch (command) {
      case "heading":
        newText = text.substring(0, start) + `## ${selectedText}` + text.substring(end);
        newStart = start + 3;
        newEnd = end + 3;
        break;
      case "bold":
        newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
        newStart = start + 2;
        newEnd = end + 2;
        break;
      case "italic":
        newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
        newStart = start + 1;
        newEnd = end + 1;
        break;
      default:
        return;
    }

    form.setValue("profile_readme", newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  }, [form]);

  return (
    <MarkdownEditorProvider
      value={form.watch("profile_readme") || ""}
      onChange={handleBodyContentChange}
    >
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
        <div className="relative">
          {/* Header with editor controls */}
          <div className="flex bg-background gap-2 items-center justify-between mb-6 sticky z-30 p-4 border-b">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <h3 className="font-semibold text-foreground">{_t("Profile README")}</h3>
              {mutation.isPending && (
                <span className="text-muted-foreground">{_t("Saving")}...</span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleEditorMode}
                className="px-4 py-1 font-semibold transition-colors duration-200 rounded-sm hover:bg-muted"
              >
                {editorMode === "write" ? _t("Preview") : _t("Editor")}
              </button>
            </div>
          </div>

          <div className="max-w-[750px] mx-auto p-4">
            {/* Editor Toolbar */}
            <div className="flex w-full gap-4 p-3 mb-4 bg-muted rounded-md">
              <EditorCommandButton
                onClick={() => executeCommand("heading")}
                Icon={<HeadingIcon />}
              />
              <EditorCommandButton
                onClick={() => executeCommand("bold")}
                Icon={<FontBoldIcon />}
              />
              <EditorCommandButton
                onClick={() => executeCommand("italic")}
                Icon={<FontItalicIcon />}
              />
            </div>

            {/* Editor Content */}
            <div className="w-full">
              {editorMode === "write" ? (
                <textarea
                  disabled={mutation.isPending}
                  tabIndex={2}
                  className="focus:outline-none p-4 border bg-background w-full resize-none min-h-[400px] rounded-md"
                  placeholder={_t("Write something stunning...")}
                  ref={editorRef}
                  value={form.watch("profile_readme") ?? ""}
                  onChange={handleBodyContentChange}
                />
              ) : (
                <div className="content-typography p-4 border rounded-md min-h-[400px] bg-muted/10">
                  {form.watch("profile_readme") ? (
                    <Markdown content={form.watch("profile_readme") ?? ""} />
                  ) : (
                    <p className="text-muted-foreground italic">{_t("Nothing to preview")}</p>
                  )}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className={clsx("px-6 py-2", {
                  "bg-primary/80": mutation.isPending
                })}
              >
                {mutation.isPending && <Loader className="animate-spin mr-2 h-4 w-4" />}
                {_t("Save")}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </MarkdownEditorProvider>
  );
};

export default ReadmeForm;