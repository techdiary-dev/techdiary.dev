"use client";

import {
  listenChannel,
  REALTIME_PUSHER_EVENTS,
} from "@/lib/pusher/pusher.client";
import { useSession } from "@/store/session.atom";
import { useQueryClient } from "@tanstack/react-query";
import React, { PropsWithChildren, useEffect } from "react";

/**
 * Subscribes to the authenticated user's private Pusher channel
 * (`private-user.{userId}`) and invalidates TanStack Query caches
 * when realtime events arrive.
 *
 * Phase 1 — Notifications:
 *   event `notification.new` → invalidate `my-notifications` and
 *   `unread-notification-count`.
 *
 * This component is a no-op when Pusher is not configured
 * (NEXT_PUBLIC_PUSHER_APP_KEY is absent) or when the user is not
 * signed in.
 */
export function RealtimeProvider({ children }: PropsWithChildren) {
  const session = useSession();
  const queryClient = useQueryClient();

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const channelName = `private-user.${userId}`;
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["unread-notification-count"],
      });
    };
    return listenChannel(channelName, {
      [REALTIME_PUSHER_EVENTS.NOTIFICATION_NEW]: invalidate,
    });
  }, [userId, queryClient]);

  return <>{children}</>;
}
