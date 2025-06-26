"use client";

import * as articleActions from "@/backend/services/article.actions";
import { useAppConfirm } from "@/components/app-confirm";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import VisibilitySensor from "@/components/VisibilitySensor";
import { useTranslation } from "@/i18n/use-translation";
import { actionPromisify, formattedTime } from "@/lib/utils";
import {
  CardStackIcon,
  DotsHorizontalIcon,
  Pencil1Icon,
  PlusIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import clsx from "clsx";
import { addDays, differenceInHours } from "date-fns";
import { TrashIcon } from "lucide-react";
import Link from "next/link";

const DashboardArticleList = () => {
  const { _t } = useTranslation();
  const queryClient = useQueryClient();
  const appConfirm = useAppConfirm();
  const feedInfiniteQuery = useInfiniteQuery({
    queryKey: ["dashboard-articles"],
    queryFn: ({ pageParam }) =>
      articleActions.myArticles({ limit: 10, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const _page = lastPage?.meta?.currentPage ?? 1;
      const _totalPages = lastPage?.meta?.totalPages ?? 1;
      return _page + 1 <= _totalPages ? _page + 1 : null;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (article_id: string) =>
      actionPromisify(articleActions.scheduleArticleDelete(article_id), {
        enableToast: true,
      }),
    onMutate: async (article_id: string) => {
      await queryClient.cancelQueries({ queryKey: ["dashboard-articles"] });

      const previousData = queryClient.getQueryData(["dashboard-articles"]);

      queryClient.setQueryData(["dashboard-articles"], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            nodes: page.nodes.map((article: any) =>
              article.id === article_id
                ? { ...article, delete_scheduled_at: addDays(new Date(), 7) }
                : article
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["dashboard-articles"], context.previousData);
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (article_id: string) =>
      actionPromisify(
        articleActions.restoreShceduleDeletedArticle(article_id),
        { enableToast: true }
      ),
    onMutate: async (article_id: string) => {
      await queryClient.cancelQueries({ queryKey: ["dashboard-articles"] });

      const previousData = queryClient.getQueryData(["dashboard-articles"]);

      queryClient.setQueryData(["dashboard-articles"], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            nodes: page.nodes.map((article: any) =>
              article.id === article_id
                ? { ...article, delete_scheduled_at: null }
                : article
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["dashboard-articles"], context.previousData);
      }
    },
  });

  return (
    <div>
      <div className="flex items-center gap-2 justify-between">
        <h3 className="text-lg font-semibold">{_t("Articles")}</h3>

        <Button asChild>
          <Link href={`/dashboard/articles/new`}>
            <PlusIcon className="w-5 h-5" />
            <span className="ml-2">{_t("New diary")}</span>
          </Link>
        </Button>
      </div>

      <div className="flex flex-col divide-y divide-dashed divide-border-color mt-2">
        {feedInfiniteQuery.isFetching &&
          Array.from({ length: 10 }).map((_, i) => (
            <article key={i} className=" bg-muted h-20 animate-pulse" suppressHydrationWarning />
          ))}

        {feedInfiniteQuery.data?.pages.map((page) => {
          return page?.nodes.map((article) => (
            <article
              key={article.id}
              className={clsx(
                "flex justify-between flex-col md:flex-row py-3 space-y-2 px-2",
                { "bg-destructive/10": !!article.delete_scheduled_at }
              )}
            >
              <div className="flex flex-col">
                <Link
                  className="text-forground text-md md:text-xl"
                  href={`/dashboard/articles/${article?.id}`}
                >
                  {article.title}
                </Link>
                {article?.delete_scheduled_at && (
                  <p className="text-destructive text-sm">
                    {_t("Article will be deleted within $ hours", [
                      differenceInHours(
                        new Date(article?.delete_scheduled_at!),
                        new Date()
                      ),
                    ])}
                  </p>
                )}

                {Boolean(article?.published_at) && (
                  <p className="text-sm text-muted-foreground">
                    {_t("Published on")} {formattedTime(article.published_at!)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-10 justify-between">
                <div className="flex gap-4 items-center">
                  {/* {!article.approved_at && (
                    <p className="bg-yellow-400/30 rounded-sm px-2 py-1 text-sm">
                      🚧 {_t("অনুমোদনাধীন")}
                    </p>
                  )} */}

                  {/* {article.approved_at && (
                    <p className="bg-green-400/30 rounded-sm px-2 py-1 text-sm">
                      ✅ {_t("অনুমোদিত")}
                    </p>
                  )} */}

                  {!Boolean(article?.published_at) && (
                    <p className="bg-yellow-400/30 rounded-sm px-2 py-1 text-sm">
                      🚧 {_t("Draft")}
                    </p>
                  )}

                  {Boolean(article?.published_at) && (
                    <p className="bg-green-400/30 rounded-sm px-2 py-1 text-sm">
                      ✅ {_t("Published")}
                    </p>
                  )}

                  {/* <div className="text-forground-muted flex items-center gap-1">
                  <ChatBubbleIcon className="h-4 w-4" />
                  <p>{article?.comments_count || 0} </p>
                </div> */}

                  {/* <div className="text-forground-muted flex items-center gap-1">
                  <ThickArrowUpIcon className="h-4 w-4" />
                  <p>{article?.votes?.score || 0} </p>
                </div> */}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2">
                    <p className="text-sm md:hidden">{_t("Actions")}</p>
                    <DotsHorizontalIcon className="h-5 w-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/articles/${article?.id}`}
                        className="text-foreground"
                      >
                        <Pencil1Icon />
                        <span>{_t("Edit")}</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <button
                        onClick={() => {
                          appConfirm.show({
                            title: `${_t("Sure to unpublish")}?`,
                            children: _t(
                              "If you unpublish the article, this will be excluded in home page and search results, however direct links to the article will still work"
                            ),
                            labels: {
                              confirm: _t("Yes"),
                              cancel: _t("Cancel"),
                            },
                            async onConfirm() {
                              try {
                                await articleActions.setArticlePublished(
                                  article?.id,
                                  !Boolean(article?.published_at)
                                );
                              } finally {
                                feedInfiniteQuery.refetch();
                              }
                            },
                          });
                        }}
                      >
                        <CardStackIcon />
                        <span>
                          {Boolean(article?.published_at)
                            ? _t("Make Draft")
                            : _t("Publish")}
                        </span>
                      </button>
                    </DropdownMenuItem>
                    {article.delete_scheduled_at ? (
                      <DropdownMenuItem
                        onClick={() => {
                          restoreMutation.mutate(article.id);
                        }}
                      >
                        <ReloadIcon />
                        {_t("Restore")}
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => {
                          appConfirm.show({
                            title: _t("Sure to delete?"),
                            labels: {
                              confirm: _t("Delete"),
                            },
                            onConfirm() {
                              deleteMutation.mutate(article.id);
                            },
                          });
                        }}
                      >
                        <TrashIcon />
                        {_t("Delete")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </article>
          ));
        })}
      </div>

      {feedInfiniteQuery.hasNextPage && (
        <VisibilitySensor onLoadmore={feedInfiniteQuery.fetchNextPage} />
      )}
    </div>
  );
};

export default DashboardArticleList;
