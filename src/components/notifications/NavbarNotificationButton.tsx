"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/use-translation";
import { useSession } from "@/store/session.atom";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useUnreadNotificationCount } from "./use-unread-notification-count";

export function NavbarNotificationButton() {
  const { _t } = useTranslation();
  const authSession = useSession();
  const { data: unread = 0 } = useUnreadNotificationCount();

  if (!authSession?.session) return null;

  return (
    <Button variant="ghost" size="icon" className="relative shrink-0" asChild>
      <Link
        href="/dashboard/notifications"
        aria-label={_t("Notifications")}
        title={_t("Notifications")}
      >
        <Bell className="size-[1.15rem]" strokeWidth={2} />
        {unread > 0 ? (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground tabular-nums">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
