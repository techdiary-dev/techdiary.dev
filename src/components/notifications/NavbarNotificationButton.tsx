"use client";

import { MyNotificationsFeed } from "@/components/notifications/MyNotificationsFeed";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "@/i18n/use-translation";
import { useSession } from "@/store/session.atom";
import { Bell } from "lucide-react";
import { useState } from "react";
import { useUnreadNotificationCount } from "./use-unread-notification-count";

export function NavbarNotificationButton() {
  const { _t } = useTranslation();
  const authSession = useSession();
  const { data: unread = 0 } = useUnreadNotificationCount();
  const [open, setOpen] = useState(false);

  if (!authSession?.session) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative shrink-0"
          aria-label={_t("Notifications")}
          title={_t("Notifications")}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <Bell className="size-[1.15rem]" strokeWidth={2} />
          {unread > 0 ? (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground tabular-nums">
              {unread > 99 ? "99+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className="flex w-[min(100vw-1.5rem,22rem)] max-h-[min(70vh,100rem)] flex-col overflow-hidden p-0"
      >
        <MyNotificationsFeed
          variant="dropdown"
          onNavigate={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
