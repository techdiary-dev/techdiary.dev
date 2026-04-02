/**
 * Canonical Pusher event names for app realtime (invalidate / refetch signals).
 * Extend here so client listeners and server triggers stay aligned.
 */
export const REALTIME_PUSHER_EVENTS = {
  NOTIFICATION_NEW: "notification.new",
  COMMENT_CREATED: "comment.created",
  COMMENT_UPDATED: "comment.updated",
  COMMENT_DELETED: "comment.deleted",
} as const;

export type RealtimePusherEvent =
  (typeof REALTIME_PUSHER_EVENTS)[keyof typeof REALTIME_PUSHER_EVENTS];

/** Handlers object for `listenChannel`: only known event names, each optional. */
export type RealtimeListenHandlers = {
  [K in RealtimePusherEvent]?: () => void;
};
