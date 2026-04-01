"use client";

import * as notificationActions from "@/backend/services/notifications.actions";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/use-translation";
import { formattedTime } from "@/lib/utils";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { BellIcon, CheckCheckIcon, Loader } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  NotificationType,
  NotificationPayload,
  Notification,
} from "@/backend/models/domain-models";
import VisibilitySensor from "@/components/VisibilitySensor";

interface NotificationMeta {
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
  totalPages: number;
}

interface NotificationListData {
  nodes: Notification[];
  meta: NotificationMeta;
}

type ListResult = Awaited<
  ReturnType<typeof notificationActions.listMyNotifications>
>;

function isNotificationSuccess(
  page: ListResult | undefined
): page is NotificationListData {
  return Boolean(page && "meta" in page && "nodes" in page);
}

function notificationCopy(
  type: NotificationType,
  _t: (key: string) => string
): string {
  switch (type) {
    case "COMMENT_ON_ARTICLE":
      return _t("commented on your article");
    case "REPLY_TO_COMMENT":
      return _t("replied to your comment");
    case "COMMENT_ON_GIST":
      return _t("commented on your gist");
    case "REACTION_ON_ARTICLE":
      return _t("reacted to your article");
    case "REACTION_ON_COMMENT":
      return _t("reacted to your comment");
    default:
      return "";
  }
}

function notificationLink(
  type: NotificationType,
  payload?: NotificationPayload | null
): string {
  if (!payload) return "#";
  if (
    (type === "COMMENT_ON_ARTICLE" || type === "REACTION_ON_ARTICLE") &&
    payload.article_handle
  ) {
    const base = payload.article_author_username
      ? `/@${payload.article_author_username}/${payload.article_handle}`
      : `/@${payload.article_handle}`;
    return base;
  }
  if (type === "COMMENT_ON_GIST" && payload.gist_id) {
    return `/gists/${payload.gist_id}`;
  }
  if (
    (type === "REPLY_TO_COMMENT" || type === "REACTION_ON_COMMENT") &&
    payload.article_handle
  ) {
    const base = payload.article_author_username
      ? `/@${payload.article_author_username}/${payload.article_handle}`
      : `/@${payload.article_handle}`;
    return base;
  }
  return "#";
}

const NotificationPage = () => {
  const { _t } = useTranslation();
  const queryClient = useQueryClient();

  const feedQuery = useInfiniteQuery({
    queryKey: ["my-notifications"],
    queryFn: ({ pageParam }) =>
      notificationActions.listMyNotifications({ page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!isNotificationSuccess(lastPage)) return null;
      return lastPage.meta.hasNextPage
        ? lastPage.meta.currentPage + 1
        : null;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      notificationActions.markNotificationRead({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["unread-notification-count"],
      });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationActions.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["unread-notification-count"],
      });
    },
  });

  const hasItems = useMemo(() => {
    const firstOk = feedQuery.data?.pages.find(isNotificationSuccess);
    return (firstOk?.nodes.length ?? 0) > 0;
  }, [feedQuery]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{_t("Notifications")}</h3>
        {hasItems && (
          <Button
            variant="outline"
            size="sm"
            disabled={markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
          >
            <CheckCheckIcon className="size-4 mr-1" />
            {_t("Mark all as read")}
          </Button>
        )}
      </div>

      {!hasItems && !feedQuery.isFetching && (
        <div className="min-h-40 border border-dashed border-muted grid place-content-center mt-4">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <BellIcon className="size-8" />
            <p>{_t("No notifications yet")}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col divide-y divide-dashed divide-border mt-2">
        {feedQuery.isFetching && !feedQuery.data && (
          <div className="py-4">
            <Loader className="size-6 animate-spin" />
          </div>
        )}

        {feedQuery.data?.pages.flatMap((page) => {
          if (!isNotificationSuccess(page)) return [];
          return page.nodes.map((notification) => {
            const isUnread = !notification.read_at;
            const link = notificationLink(
              notification.type,
              notification.payload
            );
            return (
              <div
                key={notification.id}
                className={`flex items-start justify-between gap-3 py-3 ${
                  isUnread ? "font-medium" : "opacity-70"
                }`}
              >
                <Link
                  href={link}
                  className="flex flex-col gap-0.5 flex-1 hover:underline"
                >
                  <span className="text-sm">
                    <span className="font-semibold">
                      {notification.actor?.name ??
                        notification.payload?.actor_name ??
                        "Someone"}
                    </span>{" "}
                    {notificationCopy(notification.type, _t)}
                    {notification.payload?.article_title && (
                      <span className="text-muted-foreground">
                        {" — "}
                        {notification.payload.article_title}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formattedTime(new Date(notification.created_at))}
                  </span>
                </Link>
                {isUnread && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs shrink-0"
                    disabled={markReadMutation.isPending}
                    onClick={() => markReadMutation.mutate(notification.id)}
                  >
                    {_t("Mark as read")}
                  </Button>
                )}
              </div>
            );
          });
        })}
      </div>

      {feedQuery.hasNextPage && (
        <VisibilitySensor onLoadmore={feedQuery.fetchNextPage} />
      )}
    </div>
  );
};

export default NotificationPage;
