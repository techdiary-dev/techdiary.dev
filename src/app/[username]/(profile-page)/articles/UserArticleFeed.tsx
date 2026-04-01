"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import * as articleActions from "@/backend/services/article.actions";
import React, { useMemo } from "react";
import ArticleCard from "@/components/ArticleCard";
import { readingTime } from "@/lib/utils";
import VisibilitySensor from "@/components/VisibilitySensor";
import getFileUrl from "@/utils/getFileUrl";
import { useTranslation } from "@/i18n/use-translation";
import Image from "next/image";

interface UserArticleFeedProps {
  userId: string;
}

const UserArticleFeed: React.FC<UserArticleFeedProps> = ({ userId }) => {
  const { _t } = useTranslation();

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
    return feedInfiniteQuery.data?.pages.flatMap((page) => page?.nodes) ?? [];
  }, [feedInfiniteQuery.data]);

  const showEmpty =
    !feedInfiniteQuery.isPending &&
    !feedInfiniteQuery.isError &&
    feedArticles.length === 0;

  return (
    <>
      {feedInfiniteQuery.isPending && (
        <div className="flex flex-col gap-10 pt-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-56 bg-muted animate-pulse mx-4" />
          ))}
        </div>
      )}

      {feedInfiniteQuery.isError && (
        <div className="py-10 px-4 text-center text-sm text-muted-foreground">
          {_t("Could not load articles.")}
        </div>
      )}

      {showEmpty && (
        <div className="py-10 flex flex-col items-center justify-center gap-4 px-4">
          <Image
            src="/images/robots-drones-artificial-intelligence-1.png"
            alt=""
            width={220}
            height={220}
            className="mx-auto opacity-90"
          />
          <h2 className="text-xl font-semibold text-center">
            {_t("No articles published yet")}
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {_t("When this user publishes articles, they will show up here.")}
          </p>
        </div>
      )}

      {feedArticles.map((article) => (
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
