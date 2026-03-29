"use client";

import { useTranslation } from "@/i18n/use-translation";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ProfileNavigationProps {
  username: string;
}

const ProfileNavigation: React.FC<ProfileNavigationProps> = ({ username }) => {
  const pathname = usePathname();
  const { _t } = useTranslation();

  return (
    <nav className="flex items-center bg-muted rounded-tl-md rounded-tr-md">
      <Link
        href={`/@${username}`}
        className={clsx("pr-2 text-muted-foreground p-2", {
          "border-b-4 border-primary": pathname === `/@${username}`,
        })}
      >
        {_t("Overview")}
      </Link>
      <Link
        href={`/@${username}/articles`}
        className={clsx("pr-2 text-muted-foreground p-2", {
          "border-b-4 border-primary": pathname === `/@${username}/articles`,
        })}
      >
        {_t("Articles")}
      </Link>
    </nav>
  );
};

export default ProfileNavigation;
