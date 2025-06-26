import * as sessionActions from "@/backend/services/session.actions";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import React, { PropsWithChildren } from "react";
import DashboardScaffold from "./_components/DashboardScaffold";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | TechDiary",
  },
};

const layout: React.FC<PropsWithChildren> = async ({ children }) => {
  const _headers = await headers();
  const currentPath = _headers.get("x-current-path");
  const session = await sessionActions.getSession();

  const cookieStore = await cookies();

  const getSidebarOpenState = () => {
    const isOpen = cookieStore.get("sidebar_state")?.value;
    if (!isOpen) return true;
    return cookieStore.get("sidebar_state")?.value === "true";
  };

  if (!session?.user) {
    redirect(`/login?next=${currentPath}`);
  }

  return (
    <SidebarProvider defaultOpen={getSidebarOpenState()}>
      <DashboardScaffold>{children}</DashboardScaffold>
    </SidebarProvider>
  );
};

export default layout;
