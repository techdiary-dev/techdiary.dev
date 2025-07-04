"use client";

import { Article, Tag } from "@/backend/models/domain-models";
import * as articleActions from "@/backend/services/article.actions";
import * as tagActions from "@/backend/services/tag.action";
import { ArticleRepositoryInput } from "@/backend/services/inputs/article.input";
import MultipleSelector from "@/components/ui/multi-select";
import { useImmer } from "use-immer";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useTranslation } from "@/i18n/use-translation";
import { useSession } from "@/store/session.atom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LinkIcon, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod/v4";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Sheet, SheetContent } from "../ui/sheet";
import { Textarea } from "../ui/textarea";
import { actionPromisify } from "@/lib/utils";
import { slugify } from "@/lib/slug-helper.util";

interface Props {
  article: Article;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}
const ArticleEditorDrawer: React.FC<Props> = ({ article, open, onClose }) => {
  const session = useSession();
  const { _t } = useTranslation();
  const router = useRouter();
  const updateMyArticleMutation = useMutation({
    mutationFn: (
      input: z.infer<typeof ArticleRepositoryInput.updateMyArticleInput>
    ) =>
      actionPromisify(articleActions.updateMyArticle(input), {
        enableToast: true,
      }),
    onSuccess: () => {
      router.refresh();
    },
    onError(err) {
      alert(err.message);
    },
  });

  const [selectedTags, setSelectedTags] = useImmer<Tag[]>(article.tags ?? []);

  const setDebounceHandler = useDebouncedCallback(async (slug: string) => {
    const handle = await articleActions.getUniqueArticleHandle(slug);
    form.setValue("handle", handle);
    updateMyArticleMutation.mutate({
      article_id: article?.id ?? "",
      handle: handle,
    });
  }, 2000);

  const form = useForm<
    z.infer<typeof ArticleRepositoryInput.updateMyArticleInput>
  >({
    defaultValues: {
      article_id: article.id,
      title: article?.title ?? "",
      handle: article?.handle ?? "",
      excerpt: article?.excerpt ?? "",
      tag_ids: article?.tags?.map((tag) => tag.id) ?? [],
      metadata: {
        seo: {
          title: article?.metadata?.seo?.title ?? "",
          description: article?.metadata?.seo?.description ?? "",
          keywords: article?.metadata?.seo?.keywords ?? [],
          canonical_url: article?.metadata?.seo?.canonical_url ?? "",
        },
      },
    },
    resolver: zodResolver(ArticleRepositoryInput.updateMyArticleInput),
  });

  const handleOnSubmit: SubmitHandler<
    z.infer<typeof ArticleRepositoryInput.updateMyArticleInput>
  > = (payload) => {
    updateMyArticleMutation.mutate({
      article_id: article?.id ?? "",
      excerpt: payload.excerpt,
      handle: payload.handle,
      tag_ids: payload.tag_ids,
      metadata: {
        seo: {
          title: payload.metadata?.seo?.title ?? "",
          description: payload.metadata?.seo?.description ?? "",
          keywords: payload.metadata?.seo?.keywords ?? [],
          canonical_url: payload.metadata?.seo?.canonical_url ?? "",
        },
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <div className="p-4 overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="flex flex-col gap-2"
            >
              {/* {JSON.stringify({
                errors: form.formState.errors,
                values: form.watch("tag_ids"),
              })} */}
              {/* <pre>{JSON.stringify(article, null, 2)}</pre> */}
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="handle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{_t("Handle")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your handle"
                          Prefix={
                            <LinkIcon className="size-3 text-muted-foreground" />
                          }
                          {...field}
                          onChange={(e) => {
                            setDebounceHandler(e.target.value);
                            form.setValue("handle", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription className="-mt-1">
                        https://www.techdiary.dev/@{session?.user?.username}/
                        {form.watch("handle")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{_t("Excerpt")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tag_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{_t("Tags")}</FormLabel>
                      <FormDescription className="text-xs">
                        {_t("Select tags to help categorize your article.")}
                      </FormDescription>
                      <FormControl>
                        {/* https://shadcnui-expansions.typeart.cc/docs/multiple-selector#Async%20Search%20and%20Creatable%20and%20Group */}
                        <MultipleSelector
                          maxSelected={10}
                          onSearch={async (searchTerm) => {
                            const res = await tagActions.getTags({
                              limit: -1,
                              page: 1,
                              search: searchTerm,
                            });

                            if (!res.success) {
                              return [];
                            }

                            return (
                              res.data?.map((tag) => ({
                                label: tag.name,
                                value: tag.id,
                              })) ?? []
                            );
                          }}
                          value={
                            selectedTags?.map((option) => ({
                              label: option.name,
                              value: option.id,
                            })) ?? []
                          }
                          creatable
                          onCreate={async (data) => {
                            const name = slugify(data);
                            const createdResponse = await tagActions.createTag({
                              name,
                            });
                            const old_tags = form.watch("tag_ids") ?? [];

                            if (!createdResponse.success) {
                              return;
                            }

                            setSelectedTags(function (draft) {
                              draft.push({
                                id: createdResponse.data.id!,
                                name: name,
                                created_at: new Date(),
                                updated_at: new Date(),
                              });
                            });
                            form.setValue("tag_ids", [
                              ...old_tags,
                              createdResponse?.data.id! as string,
                            ]);
                          }}
                          onChange={(e) => {
                            console.log(e);
                            setSelectedTags(
                              e.map((option) => ({
                                id: option.value,
                                name: option.label,
                                created_at: new Date(),
                                updated_at: new Date(),
                              }))
                            );
                            form.setValue(
                              "tag_ids",
                              e.map((option) => option.value)
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Seo settings */}
              <div className="flex flex-col gap-6 mt-10">
                <div className="flex items-center gap-1">
                  <p className="font-semibold">{_t("Seo Settings")}</p>
                  <span className="h-[1px] flex-1 bg-muted"></span>
                </div>

                <FormField
                  control={form.control}
                  name="metadata.seo.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{_t("SEO Title")}</FormLabel>
                      <FormDescription className="text-xs">
                        {_t(
                          "Override your article title for Google search results and social media cards. Keep it 40-50 characters for best performance."
                        )}
                      </FormDescription>
                      <FormControl>
                        <Input {...field} placeholder={form.watch("title")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name="metadata.seo.keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{_t("SEO Keywords")}</FormLabel>
                      <FormDescription className="text-xs">
                        Put some relevent keywords for better search engine
                        visibility.
                      </FormDescription>
                      <FormControl>
                        <MultipleSelector
                          creatable
                          maxSelected={10}
                          value={
                            field.value?.map((option) => ({
                              label: option,
                              value: option,
                            })) ?? []
                          }
                          onChange={(options) => {
                            field.onChange(
                              options.map((option) => option.value)
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                <FormField
                  control={form.control}
                  name="metadata.seo.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{_t("SEO Description")}</FormLabel>
                      <FormDescription className="text-xs">
                        Override your article description for Google search
                        results and social media cards. Keep it 140-156
                        characters and include relevant keywords.
                      </FormDescription>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.seo.canonical_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{_t("Canonical URL")}</FormLabel>
                      <FormDescription className="text-xs">
                        {_t(
                          "Specify the preferred URL for this content to prevent duplicate content issues. Leave empty to use the default URL."
                        )}
                      </FormDescription>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="https://example.com/original-post"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={updateMyArticleMutation.isPending}
              >
                {updateMyArticleMutation.isPending && (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                )}
                {_t("Save")}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ArticleEditorDrawer;
