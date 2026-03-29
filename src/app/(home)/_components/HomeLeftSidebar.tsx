"use client";

import * as tagActions from "@/backend/services/tag.action";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useTranslation } from "@/i18n/use-translation";
import { homeSidebarOpenAtom } from "@/store/home-sidebar.atom";
import { useSession } from "@/store/session.atom";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import {
  BookmarkIcon,
  BellIcon,
  HomeIcon,
  PlusIcon,
  UserIcon,
  HashIcon,
  CodeIcon,
  TagsIcon,
} from "lucide-react";
import Link from "next/link";

const HomeLeftSidebar = () => {
  const [open, setOpen] = useAtom(homeSidebarOpenAtom);
  return (
    <>
      <Sidebar />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left">
          <div className="p-3">
            <Sidebar />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default HomeLeftSidebar;

const Sidebar = () => {
  const { _t } = useTranslation();
  const session = useSession();
  const isLoggedIn = Boolean(session?.user);

  const tagsQuery = useQuery({
    queryKey: ["top-tags"],
    queryFn: () => tagActions.getTopTags(8),
    staleTime: 1000 * 60 * 5,
  });

  const tags = (tagsQuery.data?.success ? tagsQuery.data.data : []) as {
    id: string;
    name: string;
  }[];

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Section 1 — Primary navigation */}
      <div className="flex flex-col gap-1">
        <NavLink href="/" icon={<HomeIcon size={17} />} label={_t("Home")} />
        <NavLink href="/gists" icon={<CodeIcon size={17} />} label={_t("Gists")} />
        <Link
          href="/dashboard/articles/new"
          className="flex items-center gap-2.5 mt-1 px-2 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <PlusIcon size={17} />
          {_t("Write a diary")}
        </Link>
      </div>

      {/* Section 2 — Personal (logged-in only) */}
      {isLoggedIn && (
        <div className="flex flex-col gap-1">
          <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {_t("Personal")}
          </p>
          <NavLink
            href={`/@${session!.user!.username}`}
            icon={<UserIcon size={17} />}
            label={_t("My Profile")}
          />
          <NavLink
            href={`/@${session!.user!.username}/articles`}
            icon={<PlusIcon size={17} />}
            label={_t("My Articles")}
          />
          <NavLink
            href={`/@${session!.user!.username}/gists`}
            icon={<CodeIcon size={17} />}
            label={_t("My Gists")}
          />
          <NavLink
            href="/dashboard/bookmarks"
            icon={<BookmarkIcon size={17} />}
            label={_t("Bookmarks")}
          />
          <NavLink
            href="/dashboard/notifications"
            icon={<BellIcon size={17} />}
            label={_t("Notifications")}
          />
        </div>
      )}

      {/* Section 3 — Topics */}
      <div className="flex flex-col gap-1">
        <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {_t("Topics")}
        </p>
        <NavLink
          href="/tags"
          icon={<TagsIcon size={17} />}
          label={_t("All tags")}
        />
        {tags.map((tag) => (
          <NavLink
            key={tag.id}
            href={`/tags/${tag.name}`}
            icon={<HashIcon size={17} />}
            label={tag.name}
          />
        ))}
        {tagsQuery.isLoading && (
          <div className="flex flex-col gap-2 px-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 w-24 rounded bg-muted animate-pulse" />
            ))}
          </div>
        )}
        {!tagsQuery.isLoading && tags.length === 0 && (
          <p className="px-2 text-sm text-muted-foreground">{_t("No tags found")}</p>
        )}
      </div>
    </div>
  );
};

const NavLink = ({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) => (
  <Link
    href={href}
    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-foreground hover:bg-muted transition-colors"
  >
    <span className="text-muted-foreground">{icon}</span>
    {label}
  </Link>
);
