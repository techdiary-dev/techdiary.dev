import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Calendar,
  CommandIcon,
  Home,
  Inbox,
  Search,
  Settings,
} from "lucide-react";
import React, { PropsWithChildren } from "react";
import DashboardSidebar from "./DashboardSidebar";
import AuthenticatedUserMenu from "@/components/Navbar/AuthenticatedUserMenu";
import ThemeSwitcher from "@/components/Navbar/ThemeSwitcher";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import LanguageSwitcher from "@/components/Navbar/LanguageSwitcher";

interface DashboardScaffoldProps {}

const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

const DashboardScaffold: React.FC<
  PropsWithChildren<DashboardScaffoldProps>
> = ({ children }) => {
  return (
    <>
      <DashboardSidebar />
      <main className="w-full">
        <div className="p-4 flex items-center gap-2 justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger />
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex items-center gap-2">
                  <CommandIcon className="size-4" />
                  <span>+</span>
                  <span className=" text-lg">b</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <AuthenticatedUserMenu />
          </div>
        </div>
        <div className="flex-1 p-4 wrapper mx-auto">{children}</div>
      </main>
    </>
  );
};

export default DashboardScaffold;
