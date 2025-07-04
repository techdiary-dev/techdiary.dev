"use client";

import { Article, DIRECTORY_NAME } from "@/backend/models/domain-models";
import * as articleActions from "@/backend/services/article.actions";
import { useTranslation } from "@/i18n/use-translation";
import { zodResolver } from "@hookform/resolvers/zod";

import { ArrowLeftIcon, GearIcon, PlusIcon } from "@radix-ui/react-icons";
import React, { useCallback, useRef, useState } from "react";

import { ArticleRepositoryInput } from "@/backend/services/inputs/article.input";
import { useAutosizeTextArea } from "@/hooks/use-auto-resize-textarea";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useServerFile } from "@/hooks/use-file-upload";
import { useToggle } from "@/hooks/use-toggle";
import { actionPromisify, formattedTime } from "@/lib/utils";
import { markdocParser } from "@/lib/markdown/markdoc-parser";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { TrashIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useAppConfirm } from "../app-confirm";
import AppImage from "../AppImage";
import ImageDropzoneWithCropper from "../ImageDropzoneWithCropper";
import { Dialog, DialogContent } from "../ui/dialog";
import UnsplashImageGallery from "../UnsplashImageGallery";
import ArticleEditorDrawer from "./ArticleEditorDrawer";
import { MarkdownEditorContent } from "./MarkdownEditorContent";
import { MarkdownEditorProvider } from "./MarkdownEditorProvider";
import Markdown from "@/lib/markdown/Markdown";

interface ArticleEditorProps {
  uuid?: string;
  article?: Article;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ article, uuid }) => {
  const { _t, lang } = useTranslation();
  const serverFile = useServerFile();
  const router = useRouter();
  const [isOpenSettingDrawer, toggleSettingDrawer] = useToggle();
  const [isOpenThumbnailDrawer, thumbnailDrawerHandler] = useToggle();
  const [isOpenUnsplashDrawer, unsplashDrawerHandler] = useToggle();
  const appConfig = useAppConfirm();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");

  const editorForm = useForm({
    defaultValues: {
      title: article?.title || "",
      body: article?.body || "",
      cover_image: article?.cover_image,
    },
    resolver: zodResolver(ArticleRepositoryInput.updateArticleInput),
  });

  const watchedTitle = editorForm.watch("title");
  const watchedBody = editorForm.watch("body");

  useAutosizeTextArea(titleRef, watchedTitle ?? "");

  const updateMyArticleMutation = useMutation({
    mutationFn: (
      input: z.infer<typeof ArticleRepositoryInput.updateMyArticleInput>
    ) => actionPromisify(articleActions.updateMyArticle(input)),
    onSuccess: () => router.refresh(),
    onError: (err) => alert(JSON.stringify(err.stack)),
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
      onConfirm: async () => {
        if (uuid) {
          await articleActions.setArticlePublished(
            uuid,
            !Boolean(article?.published_at)
          );
          router.refresh();
        }
      },
    });
  }, [appConfig, _t, uuid, article?.published_at, updateMyArticleMutation]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      editorForm.setValue("title", value);
      setDebouncedTitle(value);
    },
    [editorForm, setDebouncedTitle]
  );

  return (
    <MarkdownEditorProvider
      value={watchedBody || ""}
      onChange={handleBodyContentChange}
    >
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
                  "bg-green-100": Boolean(article?.published_at),
                  "bg-red-100": !Boolean(article?.published_at),
                })}
              >
                {Boolean(article?.published_at) ? (
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
                    "bg-success text-slate-800": !Boolean(
                      article?.published_at
                    ),
                    "text-destructive text-destructive-foreground": Boolean(
                      article?.published_at
                    ),
                  }
                )}
              >
                {Boolean(article?.published_at)
                  ? _t("Unpublish")
                  : _t("Publish")}
              </button>
              <button onClick={toggleSettingDrawer.open}>
                <GearIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="max-w-[750px] mx-auto p-4 md:p-0">
          {uuid && (
            <div className="mb-10">
              {editorForm.watch("cover_image") ? (
                <div className="relative overflow-hidden rounded-md">
                  <AppImage
                    imageSource={editorForm.watch("cover_image")!}
                    width={1200}
                    height={630}
                  />
                  <button
                    onClick={() => {
                      serverFile.deleteFile(
                        [editorForm.watch("cover_image")?.key!],
                        () => {
                          editorForm.setValue("cover_image", null);
                          updateMyArticleMutation.mutate({
                            article_id: uuid,
                            cover_image: null,
                          });
                        }
                      );
                    }}
                    className="absolute flex items-center p-2 rounded bg-destructive text-destructive-foreground top-4 right-4"
                  >
                    <TrashIcon className="w-6 h-6 mr-1" />
                    <p>{_t("Delete")}</p>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 md:items-center md:flex-row">
                  {/* Cover uploader button group */}
                  <button
                    onClick={thumbnailDrawerHandler.toggle}
                    className="flex items-center gap-2 text-forground-muted hover:underline hover:text-primary"
                  >
                    <PlusIcon className="w-3 h-3" />
                    <p>{_t("Upload article cover")}</p>
                  </button>

                  <button
                    onClick={unsplashDrawerHandler.toggle}
                    className="flex items-center gap-2 text-forground-muted hover:underline hover:text-primary"
                  >
                    <PlusIcon className="w-3 h-3" />
                    <p>{_t("Pick cover from unsplash")}</p>
                  </button>
                </div>
              )}
            </div>
          )}
          <textarea
            placeholder={_t("Title")}
            tabIndex={1}
            rows={1}
            value={watchedTitle}
            disabled={
              articleCreateMutation.isPending ||
              updateMyArticleMutation.isPending
            }
            className="w-full text-2xl focus:outline-none bg-background resize-none"
            ref={titleRef}
            onBlur={(e) => handleSaveArticleOnBlurTitle(e.target.value)}
            onChange={handleTitleChange}
          />

          <MarkdownEditorContent
            bodyRef={bodyRef}
            onChange={handleBodyContentChange}
          />

          <div className="w-full">
            {editorMode === "write" ? (
              <textarea
                // disabled={
                //   articleCreateMutation.isPending ||
                //   updateMyArticleMutation.isPending
                // }
                tabIndex={2}
                className="focus:outline-none h-[calc(100vh-120px)] bg-background w-full resize-none"
                placeholder={_t("Write something stunning...")}
                ref={bodyRef}
                value={watchedBody}
                onChange={handleBodyContentChange}
              />
            ) : (
              <div className="content-typography">
                {watchedBody && <Markdown content={watchedBody} />}
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

        <Dialog
          open={isOpenThumbnailDrawer}
          onOpenChange={thumbnailDrawerHandler.toggle}
        >
          <DialogContent className="md:min-w-[650px] pt-10">
            <ImageDropzoneWithCropper
              enableCropper
              label=" "
              aspectRatio={1.91 / 1}
              onUploadComplete={(file) => {
                editorForm.setValue("cover_image", file);
                thumbnailDrawerHandler.close();

                setTimeout(() => {
                  updateMyArticleMutation.mutate({
                    article_id: uuid!,
                    cover_image: file,
                  });
                }, 0);
              }}
              onFileDeleteComplete={() => {
                editorForm.setValue("cover_image", null);
                thumbnailDrawerHandler.close();

                setTimeout(() => {
                  updateMyArticleMutation.mutate({
                    article_id: uuid!,
                    cover_image: null,
                  });
                }, 0);
              }}
              prefillFile={editorForm.watch("cover_image")}
              uploadDirectory={DIRECTORY_NAME.ARTICLE_COVER}
            />
          </DialogContent>
        </Dialog>
        <Dialog
          open={isOpenUnsplashDrawer}
          onOpenChange={unsplashDrawerHandler.toggle}
        >
          <DialogContent className="md:min-w-[650px] pt-10">
            <UnsplashImageGallery
              aspectRatio={1.91 / 1}
              onUploadComplete={(file) => {
                editorForm.setValue("cover_image", file);

                setTimeout(() => {
                  updateMyArticleMutation.mutate({
                    article_id: uuid!,
                    cover_image: file,
                  });
                  unsplashDrawerHandler.close();
                }, 0);
              }}
              uploadDirectory={DIRECTORY_NAME.ARTICLE_COVER}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MarkdownEditorProvider>
  );
};

export default ArticleEditor;
