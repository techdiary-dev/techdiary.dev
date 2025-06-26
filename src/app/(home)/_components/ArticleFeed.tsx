"use client";

import * as articleActions from "@/backend/services/article.actions";
import ArticleCard from "@/components/ArticleCard";
import VisibilitySensor from "@/components/VisibilitySensor";
import { readingTime } from "@/lib/utils";
import getFileUrl from "@/utils/getFileUrl";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";

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
      <div className="flex flex-col gap-10 mt-2">
        {articleFeedQuery.isPending && (
          <>
            <div
              className="h-56 bg-muted animate-pulse mx-4"
              suppressHydrationWarning={true}
            />
            <div
              className="h-56 bg-muted animate-pulse mx-4"
              suppressHydrationWarning={true}
            />
            <div
              className="h-56 bg-muted animate-pulse mx-4"
              suppressHydrationWarning={true}
            />
            <div
              className="h-56 bg-muted animate-pulse mx-4"
              suppressHydrationWarning={true}
            />
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
