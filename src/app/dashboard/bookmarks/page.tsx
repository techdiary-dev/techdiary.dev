"use client";

import {
  myBookmarks,
  toggleResourceBookmark,
} from "@/backend/services/bookmark.action";
import { useAppConfirm } from "@/components/app-confirm";
import { Button } from "@/components/ui/button";
import VisibilitySensor from "@/components/VisibilitySensor";
import { useTranslation } from "@/i18n/use-translation";
import { formattedTime } from "@/lib/utils";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { RemoveFormatting, Trash } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface BookmarkMeta {
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
  totalPages: number;
}

interface BookmarkData {
  nodes: any[];
  meta: BookmarkMeta;
}

function isBookmarksSuccess(
  page: Awaited<ReturnType<typeof myBookmarks>> | undefined
): page is BookmarkData {
  return Boolean(page && "meta" in page && "nodes" in page);
}

const BookmarksPage = () => {
  const { _t } = useTranslation();
  const feedInfiniteQuery = useInfiniteQuery({
    queryKey: ["dashboard-articles"],
    queryFn: ({ pageParam }) =>
      myBookmarks({ limit: 10, page: pageParam, offset: 0 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!isBookmarksSuccess(lastPage)) return null;
      const _page = lastPage.meta.currentPage;
      const _totalPages = lastPage.meta.totalPages;
      return _page + 1 <= _totalPages ? _page + 1 : null;
    },
  });

  const hasItems = useMemo(() => {
    const firstOk = feedInfiniteQuery.data?.pages.find(isBookmarksSuccess);
    return (firstOk?.nodes.length ?? 0) > 0;
  }, [feedInfiniteQuery]);

  const appConfirm = useAppConfirm();
  return (
    <div>
      <h3 className="text-xl font-semibold">{_t("Bookmarks")}</h3>

      {!hasItems && (
        <div className=" min-h-30 border border-dashed border-muted grid place-content-center mt-4">
          <h3 className="text-xl">
            {_t("You didn't bookmark any article yet")}
          </h3>
        </div>
      )}

      <div className="flex flex-col divide-y divide-dashed divide-border-color mt-2">
        {feedInfiniteQuery.isFetching &&
          Array.from({ length: 10 }).map((_, i) => (
            <article key={i} className=" bg-muted h-20 animate-pulse" />
          ))}

        {feedInfiniteQuery.data?.pages.flatMap((page) => {
          if (!isBookmarksSuccess(page)) return [];
          return page.nodes.map((bookmark) => (
            <article
              key={bookmark.id}
              className="flex justify-between flex-col md:flex-row py-3 space-y-2"
            >
              <div className="flex flex-col">
                <Link
                  className="text-forground text-lg"
                  href={`/@${bookmark?.article?.path}`}
                >
                  {bookmark?.article?.title}
                </Link>
                {bookmark?.created_at && (
                  <p className="text-sm text-muted-foreground">
                    {_t("Bookmarked on")} {formattedTime(bookmark?.created_at!)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-10 justify-between">
                <div className="flex gap-4 items-center">
                  <div className="text-forground-muted flex items-center gap-1">
                    <Button
                      variant={"destructive"}
                      size={"sm"}
                      onClick={() =>
                        appConfirm.show({
                          title: _t("Sure to remove from bookmark?"),
                          labels: { confirm: _t("Remove") },
                          onConfirm() {
                            toggleResourceBookmark({
                              resource_id: bookmark.article.id,
                              resource_type: "ARTICLE",
                            }).finally(() => feedInfiniteQuery.refetch());
                          },
                        })
                      }
                    >
                      <Trash className="h-4 w-4" />
                      {_t("Remove")}
                    </Button>
                  </div>
                </div>
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

export default BookmarksPage;
