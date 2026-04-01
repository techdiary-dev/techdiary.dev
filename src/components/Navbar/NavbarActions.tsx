"use client";

import { useTranslation } from "@/i18n/use-translation";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import ThemeSwitcher from "./ThemeSwitcher";

import { useSession } from "@/store/session.atom";
import { ChevronDown, SearchIcon } from "lucide-react";
import AuthenticatedUserMenu from "./AuthenticatedUserMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import Link from "next/link";
import { useAtom } from "jotai";
import { searchBarAtom } from "@/store/search-bar.atom";

const NavbarActions: React.FC = () => {
  const { _t } = useTranslation();
  const authSession = useSession();
  const [, setSearchOpen] = useAtom(searchBarAtom);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        className="md:hidden"
        onClick={() => setSearchOpen(true)}
      >
        <SearchIcon size={18} />
      </Button>
      <LanguageSwitcher />
      <ThemeSwitcher />

      {authSession?.session ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="hidden md:inline-flex gap-1.5 pr-2"
                aria-haspopup="menu"
              >
                {_t("Create")}
                <ChevronDown className="size-4 opacity-70" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuItem asChild>
                <Link
                  className="text-foreground cursor-pointer block"
                  href="/dashboard/articles/new"
                >
                  {_t("New diary")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  className="text-foreground cursor-pointer block"
                  href="/gists/new"
                >
                  {_t("New gist")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AuthenticatedUserMenu />
        </>
      ) : (
        <UnAuthenticatedMenu />
      )}
    </div>
  );
};

export default NavbarActions;

const UnAuthenticatedMenu = () => {
  const { _t } = useTranslation();

  return (
    <Button variant={"outline"} asChild>
      <Link href="/api/auth/login">{_t("Login")}</Link>
    </Button>
  );
};
