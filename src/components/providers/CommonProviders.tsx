"use client";

import { tanstackQueryClient } from "@/lib/tanstack-query.client";
import { QueryClientProvider } from "@tanstack/react-query";
import React, { PropsWithChildren } from "react";

import SessionProvider from "@/components/providers/SessionProvider";
import { SessionResult } from "@/backend/services/action-type";
import { jotaiStore } from "@/store/store";
import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "next-themes";
import { AppConfirmProvider } from "../app-confirm";
import { AppAlertProvider } from "../app-alert";
import { AppLoginPopupProvider } from "../app-login-popup";
import { Toaster } from "../toast";

interface Props {
  session: SessionResult;
}

const CommonProviders: React.FC<PropsWithChildren<Props>> = ({
  children,
  session,
}) => {
  return (
    <JotaiProvider store={jotaiStore}>
      <QueryClientProvider client={tanstackQueryClient}>
        <SessionProvider session={session}>
          <AppConfirmProvider>
            <AppAlertProvider>
              <AppLoginPopupProvider>
                <ThemeProvider attribute="data-theme">
                  <Toaster />
                  {children}
                </ThemeProvider>
              </AppLoginPopupProvider>
            </AppAlertProvider>
          </AppConfirmProvider>
        </SessionProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
};

export default CommonProviders;
