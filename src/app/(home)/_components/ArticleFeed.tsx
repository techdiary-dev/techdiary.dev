"use client";

import * as articleActions from "@/backend/services/article.actions";
import ArticleCard from "@/components/ArticleCard";
import VisibilitySensor from "@/components/VisibilitySensor";
import { extractImageUrlsFromMarkdown, readingTime } from "@/lib/utils";
import getFileUrl from "@/utils/getFileUrl";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";

/** Mirrors `ArticleCard` layout so loading state matches width, rhythm, and rough height. */
function ArticleFeedCardSkeleton() {
  return (
    <div
      className="flex animate-pulse flex-col"
      aria-hidden
      suppressHydrationWarning
    >
      <div className="mb-4 flex items-center">
        <div className="size-8 shrink-0 rounded-full bg-muted" />
        <div className="ml-2.5 flex min-w-0 flex-1 flex-col gap-2 py-0.5">
          <div className="h-3.5 w-28 max-w-[50%] rounded bg-muted" />
          <div className="h-2.5 w-36 max-w-[60%] rounded bg-muted" />
        </div>
      </div>
      <div className="mb-3 flex flex-col space-y-2">
        <div className="h-5 w-[85%] max-w-xl rounded bg-muted" />
        <div className="h-3.5 w-full rounded bg-muted" />
        <div className="h-3.5 w-[92%] rounded bg-muted" />
      </div>
      <div className="relative mt-4 aspect-video overflow-hidden rounded-md bg-muted" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-8 w-28 rounded-md bg-muted" />
        <div className="h-8 w-8 rounded-md bg-muted" />
      </div>
    </div>
  );
}

const ArticleFeed = () => {
  const [feedType, setFeedType] = useState<"articles" | "series">("articles");

  const articleFeedQuery = useInfiniteQuery({
    queryKey: ["article-feed", feedType],
    queryFn: ({ pageParam }) =>
      articleActions.articleFeed({ limit: 5, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.meta.hasNextPage) return undefined;
      const _page = lastPage?.meta?.currentPage ?? 1;
      return _page + 1;
    },
    enabled: feedType === "articles",
  });

  // const seriesFeedQuery = useInfiniteQuery({
  //   queryKey: ["series-feed", feedType],
  //   queryFn: ({ pageParam }) =>
  //     seriesActions.seriesFeed({ limit: 5, page: pageParam }),
  //   initialPageParam: 1,
  //   getNextPageParam: (lastPage) => {
  //     if (!lastPage?.meta.hasNextPage) return undefined;
  //     const _page = lastPage?.meta?.currentPage ?? 1;
  //     return _page + 1;
  //   },
  //   enabled: feedType === "series",
  // });

  // const activeFeedQuery =
  //   feedType === "articles" ? articleFeedQuery : seriesFeedQuery;
  // const isLoading =
  //   feedType === "articles"
  //     ? articleFeedQuery.isFetching
  //     : seriesFeedQuery.isFetching;

  return (
    <>
      {/* <pre>{JSON.stringify(articleFeedQuery.data, null, 2)}</pre> */}
      <div className="flex flex-col gap-10">
        {articleFeedQuery.isPending && (
          <>
            {[0, 1, 2, 3].map((i) => (
              <ArticleFeedCardSkeleton key={i} />
            ))}
          </>
        )}
        {/* <pre>{JSON.stringify(articleFeedQuery, null, 2)}</pre> */}

        {feedType === "articles" &&
          articleFeedQuery.data?.pages
            .flatMap((page) => page?.nodes)
            .map((article) => (
              <ArticleCard
                key={article?.id}
                id={article?.id.toString()!}
                handle={article?.handle ?? ""}
                title={article?.title ?? ""}
                excerpt={article?.excerpt ?? ""}
                coverImage={getFileUrl(article?.cover_image!)}
                galleryImages={
                  !article?.cover_image
                    ? extractImageUrlsFromMarkdown(article?.body ?? "")?.splice(
                        0,
                        4,
                      )
                    : []
                }
                author={{
                  id: article?.user?.id ?? "",
                  name: article?.user?.name ?? "",
                  avatar: article?.user?.profile_photo
                    ? getFileUrl(article?.user?.profile_photo!)
                    : "",
                  username: article?.user?.username ?? "",
                  is_verified: Boolean(article?.user?.is_verified),
                }}
                publishedAt={article?.published_at?.toDateString() ?? ""}
                readingTime={readingTime(article?.body ?? "")}
              />
            ))}

        <div className="my-10">
          <VisibilitySensor
            visible={articleFeedQuery.hasNextPage}
            onLoadmore={async () => {
              console.log(`fetching next page for ${feedType}`);
              await articleFeedQuery.fetchNextPage();
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ArticleFeed;
