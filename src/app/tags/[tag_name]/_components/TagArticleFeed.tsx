"use client";

import { Tag } from "@/backend/models/domain-models";
import * as articleActions from "@/backend/services/article.actions";
import ArticleCard from "@/components/ArticleCard";
import VisibilitySensor from "@/components/VisibilitySensor";
import { useTranslation } from "@/i18n/use-translation";
import { readingTime } from "@/lib/utils";
import getFileUrl from "@/utils/getFileUrl";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";

interface TagArticleFeedProps {
  tag: Tag;
}

const TagArticleFeed: React.FC<TagArticleFeedProps> = ({ tag }) => {
  const { _t } = useTranslation();
  const tagFeedQuery = useInfiniteQuery({
    queryKey: ["tag-articles", tag?.id],
    queryFn: ({ pageParam }) =>
      articleActions.articlesByTag({
        tag_id: tag?.id,
        limit: 5,
        page: pageParam,
      }),
    initialPageParam: 1,
    enabled: Boolean(tag?.id),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.meta?.hasNextPage) return undefined;
      const _page = lastPage?.meta?.currentPage ?? 1;
      return _page + 1;
    },
  });

  const feedArticles = useMemo(() => {
    return tagFeedQuery.data?.pages.flatMap((page) => page?.nodes) ?? [];
  }, [tagFeedQuery.data]);

  const totalArticles = useMemo(() => {
    return tagFeedQuery.data?.pages?.[0]?.meta?.total ?? 0;
  }, [tagFeedQuery.data]);

  // Show loading skeletons
  if (tagFeedQuery.isPending) {
    return (
      <div className="flex flex-col gap-10 mt-2">
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
      </div>
    );
  }

  if (tagFeedQuery.isError) {
    // Show error state
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Error loading articles
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Failed to load articles for this tag.
        </p>
        <button
          onClick={() => tagFeedQuery.refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // Show empty state
  if (feedArticles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {_t("No articles found")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {_t(`No articles have been tagged with "$" yet.`, [tag?.name])}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 p-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {_t(`Articles tagged with "$"`, [tag?.name])}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {_t(`Found $ articles`, [totalArticles])}
        </p>
      </div>

      <div className="flex flex-col gap-10 mt-2">
        {feedArticles.map((article) => (
          <ArticleCard
            key={article?.id}
            id={article?.id?.toString() ?? ""}
            handle={article?.handle ?? ""}
            title={article?.title ?? ""}
            excerpt={article?.excerpt ?? ""}
            coverImage={
              article?.cover_image ? getFileUrl(article.cover_image) : ""
            }
            author={{
              id: article?.user?.id ?? "",
              name: article?.user?.name ?? "",
              avatar: article?.user?.profile_photo
                ? getFileUrl(article.user.profile_photo)
                : "",
              username: article?.user?.username ?? "",
              is_verified: Boolean(article?.user.is_verified),
            }}
            publishedAt={article?.created_at?.toDateString() ?? ""}
            readingTime={readingTime(article?.body ?? "")}
          />
        ))}

        <div className="my-10">
          <VisibilitySensor
            visible={tagFeedQuery.hasNextPage}
            onLoadmore={async () => {
              await tagFeedQuery.fetchNextPage();
            }}
          />
        </div>
      </div>
    </>
  );
};

export default TagArticleFeed;
