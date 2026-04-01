"use client";

import { getPusherClient } from "@/lib/pusher.client";
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

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `private-user.${userId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("notification.new", () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [userId, queryClient]);

  return <>{children}</>;
}
