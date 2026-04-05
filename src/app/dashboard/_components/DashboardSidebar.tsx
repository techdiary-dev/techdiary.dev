"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTranslation } from "@/i18n/use-translation";
import {
  BellIcon,
  Bookmark,
  Home,
  KeySquareIcon,
  LineChart,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadNotificationCount } from "@/components/notifications/use-unread-notification-count";

const DashboardSidebar = () => {
  const { _t } = useTranslation();
  const pathName = usePathname();
  const items = [
    {
      title: _t("Dashboard"),
      url: "",
      icon: Home,
    },
    {
      title: _t("Reach"),
      url: "/dashboard#dashboard-analytics",
      icon: LineChart,
    },
    // {
    //   title: _t("Series"),
    //   url: "/series",
    //   icon: Home,
    // },
    {
      title: _t("Bookmarks"),
      url: "/bookmarks",
      icon: Bookmark,
    },
    {
      title: _t("Settings"),
      url: "/settings",
      icon: Settings2,
    },
    {
      title: _t("Login Sessions"),
      url: "/sessions",
      icon: KeySquareIcon,
    },
  ];
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{_t("Dashboard")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.slice(0, 2).map((item, key) => (
                <SidebarMenuItem key={key}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.url.startsWith("#")
                        ? false
                        : pathName === `/dashboard${item.url}`
                    }
                  >
                    <Link
                      className="text-muted-foreground"
                      href={
                        item.url.startsWith("/dashboard#")
                          ? item.url
                          : `/dashboard${item.url}`
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <DashboardNotificationsMenuItem
                pathName={pathName}
                label={_t("Notifications")}
              />
              {items.slice(2).map((item, key) => (
                <SidebarMenuItem key={`rest-${key}`}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathName === `/dashboard${item.url}`}
                  >
                    <Link
                      className="text-muted-foreground"
                      href={`/dashboard${item.url}`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

function DashboardNotificationsMenuItem({
  pathName,
  label,
}: {
  pathName: string;
  label: string;
}) {
  const { data: unread = 0 } = useUnreadNotificationCount();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={pathName === "/dashboard/notifications"}
      >
        <Link
          className="text-muted-foreground flex w-full min-w-0 items-center gap-2"
          href="/dashboard/notifications"
        >
          <BellIcon className="shrink-0" />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {unread > 0 ? (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground tabular-nums">
              {unread > 99 ? "99+" : unread}
            </span>
          ) : null}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default DashboardSidebar;
