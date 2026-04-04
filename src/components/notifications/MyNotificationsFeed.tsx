"use client";

import * as notificationActions from "@/backend/services/notifications.actions";
import type {
  IServerFile,
  Notification,
  NotificationPayload,
  NotificationType,
} from "@/backend/models/domain-models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import VisibilitySensor from "@/components/VisibilitySensor";
import { useTranslation } from "@/i18n/use-translation";
import { cn, formattedTime, getAvatarPlaceholder } from "@/lib/utils";
import getFileUrl from "@/utils/getFileUrl";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  Code2,
  Heart,
  Loader2,
  MessageSquare,
  Reply,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

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
  page: ListResult | undefined,
): page is NotificationListData {
  return Boolean(page && "meta" in page && "nodes" in page);
}

const NOTIFICATION_TITLE_MAX = 72;

const REACTION_LABEL_EN: Record<string, string> = {
  LOVE: "Love 💖",
  FIRE: "Fire 🔥",
  UNICORN: "Unicorn 🦄",
  WOW: "Wow 😮",
  CRY: "Cry 😭",
  HAHA: "Haha 😂",
};

function truncateTitle(raw: string | undefined, max: number): string {
  const s = (raw ?? "").trim();
  if (!s) return "";
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function actorDisplayName(
  n: Notification,
  _t: (key: string, placeholderValues?: (string | number)[]) => string,
): string {
  const name = n.actor?.name?.trim() || n.payload?.actor_name?.trim();
  if (name) return name;
  const u = n.actor?.username ?? n.payload?.actor_username;
  if (u) return `@${u}`;
  return _t("Someone");
}

function reactionDisplayLabel(
  code: string | undefined,
  _t: (key: string, placeholderValues?: (string | number)[]) => string,
): string {
  const key = `notification.reaction.${code ?? "UNKNOWN"}`;
  const t = _t(key);
  if (t !== key) return t;
  if (code && REACTION_LABEL_EN[code]) return REACTION_LABEL_EN[code];
  if (code) return code.charAt(0) + code.slice(1).toLowerCase();
  return "Reaction";
}

function notificationBodyAfterActor(
  n: Notification,
  _t: (key: string, placeholderValues?: (string | number)[]) => string,
): string {
  const untitled = _t("Untitled");
  const titleArticle = truncateTitle(
    n.payload?.article_title,
    NOTIFICATION_TITLE_MAX,
  );
  const titleGist = truncateTitle(
    n.payload?.gist_title,
    NOTIFICATION_TITLE_MAX,
  );
  const reaction = reactionDisplayLabel(n.payload?.reaction_type, _t);

  switch (n.type) {
    case "COMMENT_ON_ARTICLE":
      return _t('commented on your article "$".', [titleArticle || untitled]);
    case "REPLY_TO_COMMENT": {
      const title = titleArticle || titleGist || untitled;
      return _t('replied to your comment on "$".', [title]);
    }
    case "COMMENT_ON_GIST":
      return _t('commented on your gist "$".', [titleGist || untitled]);
    case "REACTION_ON_ARTICLE":
      return _t('reacted to your article "$" with $.', [
        titleArticle || untitled,
        reaction,
      ]);
    case "REACTION_ON_COMMENT":
      return _t("reacted to your comment with $.", [reaction]);
    case "REACTION_ON_GIST":
      return _t('reacted to your gist "$" with $.', [
        titleGist || untitled,
        reaction,
      ]);
    default:
      return "";
  }
}

function notificationTypeIcon(type: NotificationType): {
  Icon: LucideIcon;
  labelKey: string;
} {
  switch (type) {
    case "COMMENT_ON_ARTICLE":
      return { Icon: MessageSquare, labelKey: "Article comment" };
    case "REPLY_TO_COMMENT":
      return { Icon: Reply, labelKey: "Comment reply" };
    case "COMMENT_ON_GIST":
      return { Icon: Code2, labelKey: "Gist comment" };
    case "REACTION_ON_ARTICLE":
    case "REACTION_ON_COMMENT":
    case "REACTION_ON_GIST":
      return { Icon: Heart, labelKey: "Reaction" };
    default:
      return { Icon: Bell, labelKey: "Notification" };
  }
}

function actorProfileHref(n: Notification): string | null {
  const u = n.actor?.username ?? n.payload?.actor_username;
  return u ? `/@${u}` : null;
}

function notificationLink(
  type: NotificationType,
  payload?: NotificationPayload | null,
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
  if (
    (type === "COMMENT_ON_GIST" || type === "REACTION_ON_GIST") &&
    payload.gist_id
  ) {
    return `/gists/${payload.gist_id}`;
  }
  if (type === "REPLY_TO_COMMENT" || type === "REACTION_ON_COMMENT") {
    if (payload.article_handle) {
      return payload.article_author_username
        ? `/@${payload.article_author_username}/${payload.article_handle}`
        : `/@${payload.article_handle}`;
    }
    if (payload.gist_id) {
      return `/gists/${payload.gist_id}`;
    }
  }
  return "#";
}

function NotificationActorAvatar({
  label,
  profilePhoto,
  profilePhotoUrl,
}: {
  label: string;
  profilePhoto?: IServerFile | null;
  profilePhotoUrl?: string | null;
}) {
  const fromStructured = profilePhoto ? getFileUrl(profilePhoto) : "";
  const fromLegacyUrl = profilePhotoUrl?.trim() ?? "";
  const src = fromStructured || fromLegacyUrl || getAvatarPlaceholder(label);

  return (
    <Avatar className="size-10 border border-border bg-background">
      <AvatarImage src={src} alt="" className="object-cover" />
      <AvatarFallback className="text-xs font-medium">
        {label.replace(/^@/, "").slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export type MyNotificationsFeedVariant = "page" | "dropdown";

export function MyNotificationsFeed({
  variant = "page",
  onNavigate,
}: {
  variant?: MyNotificationsFeedVariant;
  /** Close dropdown when user follows a link (e.g. notification or profile). */
  onNavigate?: () => void;
}) {
  const { _t } = useTranslation();
  const queryClient = useQueryClient();
  const isDropdown = variant === "dropdown";

  const feedQuery = useInfiniteQuery({
    queryKey: ["my-notifications"],
    queryFn: ({ pageParam }) =>
      notificationActions.listMyNotifications({ page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!isNotificationSuccess(lastPage)) return null;
      return lastPage.meta.hasNextPage ? lastPage.meta.currentPage + 1 : null;
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

  const isInitialLoading = feedQuery.isFetching && !feedQuery.data;

  const showNotificationList = useMemo(
    () =>
      isInitialLoading ||
      hasItems ||
      (feedQuery.data?.pages.some(
        (p) => isNotificationSuccess(p) && p.nodes.length > 0,
      ) ??
        false),
    [feedQuery.data?.pages, hasItems, isInitialLoading],
  );

  const listTopClass = isDropdown
    ? "mt-0 border-t-0"
    : "mt-4 border-t border-border";

  const emptyMinH = isDropdown ? "min-h-[140px]" : "min-h-[200px]";
  const emptyPadding = isDropdown ? "mt-4 pb-6 pt-2" : "mt-10 pb-10 pt-0";

  const body = (
    <>
      {feedQuery.isError && (
        <div
          className={cn(
            "flex flex-col gap-3 border-b border-destructive/30 pb-4 sm:flex-row sm:items-center sm:justify-between",
            isDropdown ? "px-3 pt-3" : "mt-6",
          )}
          role="alert"
        >
          <p className="text-sm text-destructive">
            {_t("Could not load notifications.")}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/30 shrink-0"
            onClick={() => feedQuery.refetch()}
          >
            {_t("Try again")}
          </Button>
        </div>
      )}

      {!hasItems && !feedQuery.isFetching && !feedQuery.isError && (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-3 border-b border-dashed border-border text-center",
            emptyMinH,
            emptyPadding,
            isDropdown && "px-3",
          )}
        >
          <Bell className="size-9 text-muted-foreground" strokeWidth={1.25} />
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              {_t("No notifications yet")}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {_t(
                "When someone interacts with your content, it will show up here.",
              )}
            </p>
          </div>
        </div>
      )}

      {showNotificationList && (
        <ul
          className={cn(
            "list-none divide-y divide-border p-0",
            listTopClass,
            isDropdown && "border-border",
          )}
          aria-busy={isInitialLoading}
        >
          {isInitialLoading &&
            Array.from({ length: isDropdown ? 4 : 6 }).map((_, i) => (
              <li key={i} className="flex gap-3 py-3 animate-pulse">
                <div className="size-10 shrink-0 bg-muted" />
                <div className="flex flex-1 flex-col gap-2 py-0.5">
                  <div className="h-4 w-[88%] max-w-md bg-muted" />
                  <div className="h-3 w-24 bg-muted" />
                </div>
              </li>
            ))}

          {feedQuery.data?.pages.flatMap((page) => {
            if (!isNotificationSuccess(page)) return [];
            return page.nodes.map((notification) => {
              const isUnread = !notification.read_at;
              const link = notificationLink(
                notification.type,
                notification.payload,
              );
              const profileHref = actorProfileHref(notification);
              const actorLabel = actorDisplayName(notification, _t);
              const { Icon: TypeIcon, labelKey: typeLabelKey } =
                notificationTypeIcon(notification.type);

              const created = new Date(notification.created_at);
              const timeTitle = created.toLocaleString();

              return (
                <li key={notification.id}>
                  <div
                    className={cn(
                      "flex gap-3 border-l-2 py-3 pl-3 transition-colors",
                      isDropdown ? "pr-2" : "",
                      isUnread ? "border-l-primary" : "border-l-transparent",
                      !isUnread && "hover:bg-muted/40",
                    )}
                  >
                    <div className="relative shrink-0">
                      {profileHref ? (
                        <Link
                          href={profileHref}
                          className="block rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          aria-label={_t("View profile of $", [actorLabel])}
                          onClick={onNavigate}
                        >
                          <NotificationActorAvatar
                            label={actorLabel}
                            profilePhoto={notification.actor?.profile_photo}
                            profilePhotoUrl={
                              notification.actor?.profile_photo
                                ? getFileUrl(notification.actor.profile_photo)
                                : null
                            }
                          />
                        </Link>
                      ) : (
                        <NotificationActorAvatar
                          label={actorLabel}
                          profilePhoto={notification.actor?.profile_photo}
                          profilePhotoUrl={
                            notification.actor?.profile_photo
                              ? getFileUrl(notification.actor.profile_photo)
                              : null
                          }
                        />
                      )}
                      <span
                        className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center border border-border bg-background text-muted-foreground"
                        title={_t(typeLabelKey)}
                        aria-hidden
                      >
                        <TypeIcon className="size-3" strokeWidth={2} />
                      </span>
                    </div>

                    <Link
                      href={link}
                      className="group/link flex min-w-0 flex-1 flex-col gap-1 py-0.5 pr-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      onClick={onNavigate}
                    >
                      <p className="text-sm leading-snug text-foreground">
                        <span className="font-semibold">{actorLabel}</span>{" "}
                        <span
                          className={cn(
                            "font-normal",
                            isUnread
                              ? "text-foreground/90"
                              : "text-muted-foreground",
                          )}
                        >
                          {notificationBodyAfterActor(notification, _t)}
                        </span>
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <time
                          dateTime={created.toISOString()}
                          title={timeTitle}
                        >
                          {formattedTime(created)}
                        </time>
                        <ChevronRight className="size-3.5 opacity-0 transition-opacity group-hover/link:opacity-70" />
                      </div>
                    </Link>

                    {isUnread && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
                            disabled={markReadMutation.isPending}
                            aria-label={_t("Mark as read")}
                            onClick={(e) => {
                              e.preventDefault();
                              markReadMutation.mutate(notification.id);
                            }}
                          >
                            <Check className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          {_t("Mark as read")}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </li>
              );
            });
          })}
        </ul>
      )}

      {showNotificationList && feedQuery.isFetchingNextPage && (
        <div
          className={cn(
            "flex justify-center py-6",
            isDropdown && "pb-4 pt-2",
          )}
        >
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {showNotificationList &&
        feedQuery.hasNextPage &&
        !feedQuery.isFetchingNextPage && (
          <VisibilitySensor onLoadmore={feedQuery.fetchNextPage} />
        )}
    </>
  );

  if (isDropdown) {
    return (
      <>
        <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2.5">
          <Link
            href="/dashboard/notifications"
            className="text-sm font-semibold tracking-tight text-foreground hover:underline"
            onClick={onNavigate}
          >
            {_t("Notifications")}
          </Link>
          {hasItems ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 px-2 text-xs"
              disabled={markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}
            >
              <CheckCheck className="mr-1 size-3.5 opacity-80" />
              {_t("Mark all as read")}
            </Button>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-0">
          {body}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {_t("Notifications")}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {_t("Activity on your articles, gists, and comments")}
          </p>
        </div>
        {hasItems && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 self-start sm:self-auto"
            disabled={markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
          >
            <CheckCheck className="mr-1.5 size-4 opacity-80" />
            {_t("Mark all as read")}
          </Button>
        )}
      </div>
      {body}
    </>
  );
}
