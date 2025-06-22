"use client";

import { Article } from "@/backend/models/domain-models";
import * as articleActions from "@/backend/services/article.actions";
import { useTranslation } from "@/i18n/use-translation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  ArrowLeftIcon,
  FontBoldIcon,
  FontItalicIcon,
  GearIcon,
  HeadingIcon,
  ImageIcon,
} from "@radix-ui/react-icons";
import React, { useCallback, useRef, useState } from "react";

import { ArticleRepositoryInput } from "@/backend/services/inputs/article.input";
import { useAutosizeTextArea } from "@/hooks/use-auto-resize-textarea";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useToggle } from "@/hooks/use-toggle";
import { formattedTime } from "@/lib/utils";
import { markdocParser } from "@/utils/markdoc-parser";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAppConfirm } from "../app-confirm";
import ArticleEditorDrawer from "./ArticleEditorDrawer";
import EditorCommandButton from "./EditorCommandButton";
import { useMarkdownEditor } from "./useMarkdownEditor";

interface ArticleEditorProps {
  uuid?: string;
  article?: Article;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ article, uuid }) => {
  const { _t, lang } = useTranslation();
  const router = useRouter();
  const [isOpenSettingDrawer, toggleSettingDrawer] = useToggle();
  const appConfig = useAppConfirm();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");

  const editorForm = useForm({
    defaultValues: {
      title: article?.title || "",
      body: article?.body || "",
    },
    resolver: zodResolver(ArticleRepositoryInput.updateArticleInput),
  });

  const watchedTitle = editorForm.watch("title");
  const watchedBody = editorForm.watch("body");

  useAutosizeTextArea(titleRef, watchedTitle ?? "");

  const updateMyArticleMutation = useMutation({
    mutationFn: (
      input: z.infer<typeof ArticleRepositoryInput.updateMyArticleInput>
    ) => articleActions.updateMyArticle(input),
    onSuccess: () => router.refresh(),
    onError: (err) => alert(err.message),
  });

  const articleCreateMutation = useMutation({
    mutationFn: (
      input: z.infer<typeof ArticleRepositoryInput.createMyArticleInput>
    ) => articleActions.createMyArticle(input),
    onSuccess: (res) => {
      if (res && res.id) {
        router.push(`/dashboard/articles/${res.id}`);
      } else {
        console.error("Article created but no ID returned", res);
        // Fallback to dashboard if ID is missing
        router.push("/dashboard/articles");
      }
    },
    onError: (err) => {
      console.error("Error creating article:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to create article. Please try again."
      );
    },
  });

  const handleDebouncedSaveTitle = useCallback(
    (title: string) => {
      if (uuid && title) {
        updateMyArticleMutation.mutate({
          title,
          article_id: uuid,
        });
      }
    },
    [uuid, updateMyArticleMutation]
  );

  const handleDebouncedSaveBody = useCallback(
    (body: string) => {
      if (!body) return;

      if (uuid) {
        updateMyArticleMutation.mutate({
          article_id: uuid,
          handle: article?.handle ?? "untitled",
          body,
        });
      } else {
        articleCreateMutation.mutate({
          title: watchedTitle?.length
            ? (watchedTitle ?? "untitled")
            : "untitled",
          body,
        });
      }
    },
    [
      uuid,
      article?.handle,
      watchedTitle,
      updateMyArticleMutation,
      articleCreateMutation,
    ]
  );

  const setDebouncedTitle = useDebouncedCallback(
    handleDebouncedSaveTitle,
    1000
  );
  const setDebouncedBody = useDebouncedCallback(handleDebouncedSaveBody, 1000);

  const handleSaveArticleOnBlurTitle = useCallback(
    (title: string) => {
      if (!uuid && title) {
        articleCreateMutation.mutate({
          title,
        });
      }
    },
    [uuid, articleCreateMutation]
  );

  const handleBodyContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement> | string) => {
      const value = typeof e === "string" ? e : e.target.value;
      editorForm.setValue("body", value);
      setDebouncedBody(value);
    },
    [editorForm, setDebouncedBody]
  );

  const editor = useMarkdownEditor({
    ref: bodyRef,
    onChange: handleBodyContentChange,
  });

  const toggleEditorMode = useCallback(
    () => setEditorMode((mode) => (mode === "write" ? "preview" : "write")),
    []
  );

  const handlePublishToggle = useCallback(() => {
    appConfig.show({
      title: _t("Are you sure?"),
      labels: {
        confirm: _t("Yes"),
        cancel: _t("No"),
      },
      onConfirm: () => {
        if (uuid) {
          updateMyArticleMutation.mutate(
            {
              article_id: uuid,
              is_published: !article?.is_published,
            },
            {
              onSuccess: () => {
                articleActions.setArticlePublished(
                  uuid,
                  !article?.is_published
                );
              },
            }
          );
        }
      },
    });
  }, [appConfig, _t, uuid, article?.is_published, updateMyArticleMutation]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      editorForm.setValue("title", value);
      setDebouncedTitle(value);
    },
    [editorForm, setDebouncedTitle]
  );

  const renderEditorToolbar = () => (
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
      <EditorCommandButton
        onClick={() => editor?.executeCommand("image")}
        Icon={<ImageIcon />}
      />
    </div>
  );

  return (
    <div className="relative">
      <div className="flex bg-background gap-2 items-center justify-between mt-2 mb-10 sticky z-30 p-5">
        <div className="flex items-center gap-2 text-sm text-forground-muted">
          <div className="flex gap-4 items-center">
            <Link href="/dashboard" className="text-forground">
              <ArrowLeftIcon width={20} height={20} />
            </Link>
            {updateMyArticleMutation.isPending ? (
              <p>{_t("Saving")}...</p>
            ) : (
              article?.updated_at && (
                <p>
                  <span>
                    ({_t("Saved")} {formattedTime(article.updated_at, lang)})
                  </span>
                </p>
              )
            )}
          </div>

          {uuid && (
            <p
              className={clsx("px-2 py-1 text-foreground", {
                "bg-green-100": article?.is_published,
                "bg-red-100": !article?.is_published,
              })}
            >
              {article?.is_published ? (
                <span className="text-success">{_t("Published")}</span>
              ) : (
                <span className="text-destructive">{_t("Draft")}</span>
              )}
            </p>
          )}
        </div>

        {uuid && (
          <div className="flex gap-2">
            <button
              onClick={toggleEditorMode}
              className="px-4 py-1 hidden md:block font-semibold transition-colors duration-200 rounded-sm hover:bg-muted"
            >
              {editorMode === "write" ? _t("Preview") : _t("Editor")}
            </button>

            <button
              onClick={handlePublishToggle}
              className={clsx(
                "transition-colors hidden md:block duration-200 px-4 py-1 font-semibold cursor-pointer",
                {
                  "bg-success text-success-foreground": !article?.is_published,
                  "text-destructive text-destructive-foreground":
                    article?.is_published,
                }
              )}
            >
              {article?.is_published ? _t("Unpublish") : _t("Publish")}
            </button>
            <button onClick={toggleSettingDrawer.open}>
              <GearIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="max-w-[750px] mx-auto p-4 md:p-0">
        <textarea
          placeholder={_t("Title")}
          tabIndex={1}
          autoFocus
          rows={1}
          value={watchedTitle}
          disabled={
            articleCreateMutation.isPending || updateMyArticleMutation.isPending
          }
          className="w-full text-2xl focus:outline-none bg-background resize-none"
          ref={titleRef}
          onBlur={(e) => handleSaveArticleOnBlurTitle(e.target.value)}
          onChange={handleTitleChange}
        />

        <div className="flex flex-col justify-between md:items-center md:flex-row">
          {renderEditorToolbar()}
        </div>

        <div className="w-full">
          {editorMode === "write" ? (
            <textarea
              disabled={
                articleCreateMutation.isPending ||
                updateMyArticleMutation.isPending
              }
              tabIndex={2}
              className="focus:outline-none h-[calc(100vh-120px)] bg-background w-full resize-none"
              placeholder={_t("Write something stunning...")}
              ref={bodyRef}
              value={watchedBody}
              onChange={handleBodyContentChange}
            />
          ) : (
            <div className="content-typography">
              {markdocParser(watchedBody ?? "")}
            </div>
          )}
        </div>
      </div>

      {uuid && article && (
        <ArticleEditorDrawer
          article={article}
          open={isOpenSettingDrawer}
          onClose={toggleSettingDrawer.close}
          onSave={() => {
            // silence is good
          }}
        />
      )}
    </div>
  );
};

export default ArticleEditor;
