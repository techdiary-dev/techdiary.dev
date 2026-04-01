"use client";

import * as notificationActions from "@/backend/services/notifications.actions";
import { useSession } from "@/store/session.atom";
import { useQuery } from "@tanstack/react-query";

export function useUnreadNotificationCount() {
  const session = useSession();
  return useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: async () => {
      const r = await notificationActions.unreadNotificationCount();
      if (!r.success) return 0;
      return r.data.count;
    },
    enabled: Boolean(session?.session),
    staleTime: 60 * 1000,
  });
}
