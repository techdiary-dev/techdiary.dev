"use client";

import { User } from "@/backend/models/domain-models";
import { UserActionInput } from "@/backend/services/inputs/user.input";
import * as userActions from "@/backend/services/user.action";
import EditorCommandButton from "@/components/Editor/EditorCommandButton";
import { useMarkdownEditor } from "@/components/Editor/useMarkdownEditor";
import { Button } from "@/components/ui/button";
import { useAutosizeTextArea } from "@/hooks/use-auto-resize-textarea";
import { useTranslation } from "@/i18n/use-translation";
import { markdocParser } from "@/lib/markdown/markdoc-parser";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FontBoldIcon,
  FontItalicIcon,
  HeadingIcon,
  ImageIcon,
} from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

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

  useAutosizeTextArea(editorRef, form.watch("profile_readme") ?? "");

  const editor = useMarkdownEditor({
    ref: editorRef,
    onChange: (value) => form.setValue("profile_readme", value),
  });

  const renderEditorToolbar = useCallback(
    () => (
      <div className="flex w-full gap-6 p-2 my-2 bg-muted">
        <EditorCommandButton
          onClick={() => editor?.executeCommand("heading")}
          Icon={<HeadingIcon />}
        />
        <EditorCommandButton
          onClick={() => editor?.executeCommand("bold")}
          Icon={<FontBoldIcon />}
        />
        <EditorCommandButton
          onClick={() => editor?.executeCommand("italic")}
          Icon={<FontItalicIcon />}
        />
        {/* <EditorCommandButton
          onClick={() => editor?.executeCommand("image")}
          Icon={<ImageIcon />}
        /> */}
      </div>
    ),
    [editor]
  );

  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
      <div className="flex items-center justify-between">
        {renderEditorToolbar()}
        <div className="flex items-center gap-4">
          {editorMode === "write" && (
            <Button
              variant={"link"}
              className="!px-2"
              type="button"
              onClick={() => setEditorMode("preview")}
            >
              {_t("Preview Mode")}
            </Button>
          )}
          {editorMode === "preview" && (
            <Button
              variant={"link"}
              className="!px-2"
              type="button"
              onClick={() => setEditorMode("write")}
            >
              {_t("Write Mode")}
            </Button>
          )}
        </div>
      </div>
      <div className="w-full">
        {editorMode === "write" ? (
          <textarea
            disabled={mutation.isPending}
            tabIndex={2}
            className="focus:outline-none p-2 border bg-background w-full resize-none"
            placeholder={_t("Write something stunning...")}
            ref={editorRef}
            value={form.watch("profile_readme") ?? ""}
            onChange={(e) => form.setValue("profile_readme", e.target.value)}
          />
        ) : (
          <div className="content-typography">
            {markdocParser(form.watch("profile_readme") ?? "")}
          </div>
        )}
      </div>

      <Button type="submit" className="mt-2" disabled={mutation.isPending}>
        {mutation.isPending && <Loader className="animate-spin" />}
        {_t("Save")}
      </Button>
    </form>
  );
};

export default ReadmeForm;
