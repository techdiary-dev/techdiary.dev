"use client";

import * as articleActions from "@/backend/services/article.actions";
import * as seriesActions from "@/backend/services/series.action";
import ArticleCard from "@/components/ArticleCard";
import SeriesCard from "@/components/SeriesCard";
import VisibilitySensor from "@/components/VisibilitySensor";
import { readingTime } from "@/lib/utils";
import getFileUrl from "@/utils/getFileUrl";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
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

  const seriesFeedQuery = useInfiniteQuery({
    queryKey: ["series-feed", feedType],
    queryFn: ({ pageParam }) =>
      seriesActions.seriesFeed({ limit: 5, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const data = lastPage?.success ? lastPage.data : null;
      if (!data?.meta?.hasNextPage) return undefined;
      const _page = data?.meta?.currentPage ?? 1;
      return _page + 1;
    },
    enabled: feedType === "series",
  });

  const activeFeedQuery =
    feedType === "articles" ? articleFeedQuery : seriesFeedQuery;
  const isLoading =
    feedType === "articles"
      ? articleFeedQuery.isFetching
      : seriesFeedQuery.isFetching;

  return (
    <>
      <div className="flex flex-col gap-10 mt-2">
        {isLoading && (
          <>
            <div className="h-56 bg-muted animate-pulse mx-4" />
            <div className="h-56 bg-muted animate-pulse mx-4" />
            <div className="h-56 bg-muted animate-pulse mx-4" />
            <div className="h-56 bg-muted animate-pulse mx-4" />
          </>
        )}

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
                  avatar: article?.user?.profile_photo ?? "",
                  username: article?.user?.username ?? "",
                }}
                publishedAt={article?.created_at.toDateString() ?? ""}
                readingTime={readingTime(article?.body ?? "")}
                likes={0}
                comments={0}
              />
            ))}

        <div className="my-10">
          <VisibilitySensor
            visible={activeFeedQuery.hasNextPage}
            onLoadmore={async () => {
              console.log(`fetching next page for ${feedType}`);
              await activeFeedQuery.fetchNextPage();
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ArticleFeed;
