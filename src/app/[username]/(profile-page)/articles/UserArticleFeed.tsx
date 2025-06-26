"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import * as articleActions from "@/backend/services/article.actions";
import React, { useMemo } from "react";
import ArticleCard from "@/components/ArticleCard";
import { readingTime } from "@/lib/utils";
import VisibilitySensor from "@/components/VisibilitySensor";
import getFileUrl from "@/utils/getFileUrl";

interface UserArticleFeedProps {
  userId: string;
}

const UserArticleFeed: React.FC<UserArticleFeedProps> = ({ userId }) => {
  const feedInfiniteQuery = useInfiniteQuery({
    queryKey: ["user-article-feed", userId],
    queryFn: ({ pageParam }) =>
      articleActions.userArticleFeed(
        {
          user_id: userId,
          limit: 5,
          page: pageParam,
        },
        [
          "id",
          "title",
          "handle",
          "cover_image",
          "body",
          "published_at",
          "created_at",
          "excerpt",
        ]
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const _page = lastPage?.meta?.currentPage ?? 1;
      const _totalPages = lastPage?.meta?.totalPages ?? 1;
      return _page + 1 <= _totalPages ? _page + 1 : null;
    },
  });

  const feedArticles = useMemo(() => {
    return feedInfiniteQuery.data?.pages.flatMap((page) => page?.nodes);
  }, [feedInfiniteQuery.data]);

  return (
    <>
      {feedInfiniteQuery.isFetching && (
        <div className="flex flex-col gap-10">
          <div className="h-56 bg-muted animate-pulse mx-4" />
          <div className="h-56 bg-muted animate-pulse mx-4" />
          <div className="h-56 bg-muted animate-pulse mx-4" />
          <div className="h-56 bg-muted animate-pulse mx-4" />
          <div className="h-56 bg-muted animate-pulse mx-4" />
          <div className="h-56 bg-muted animate-pulse mx-4" />
        </div>
      )}

      {/* <pre>{JSON.stringify(feedArticles, null, 2)}</pre> */}

      {feedArticles?.map((article) => (
        <ArticleCard
          key={article?.id}
          id={article?.id ?? ""}
          title={article?.title ?? ""}
          handle={article?.handle ?? ""}
          excerpt={article?.excerpt ?? ""}
          author={{
            id: article?.user?.id ?? "",
            name: article?.user?.name ?? "",
            avatar: getFileUrl(article?.user?.profile_photo) ?? "",
            username: article?.user?.username ?? "",
            is_verified: Boolean(article?.user?.is_verified),
          }}
          publishedAt={article?.published_at?.toDateString() ?? ""}
          readingTime={readingTime(article?.body ?? "")}
        />
      ))}

      {feedInfiniteQuery.hasNextPage && (
        <VisibilitySensor onLoadmore={feedInfiniteQuery.fetchNextPage} />
      )}
    </>
  );
};

export default UserArticleFeed;
