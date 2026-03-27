"use client";

import { tanstackQueryClient } from "@/lib/tanstack-query.client";
import { QueryClientProvider } from "@tanstack/react-query";
import React, { PropsWithChildren, Suspense } from "react";

import { jotaiStore } from "@/store/store";
import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "next-themes";
import { AppConfirmProvider } from "../app-confirm";
import { AppAlertProvider } from "../app-alert";
import { AppLoginPopupProvider } from "../app-login-popup";

const CommonProviders: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <JotaiProvider store={jotaiStore}>
      <QueryClientProvider client={tanstackQueryClient}>
        <AppConfirmProvider>
          <AppAlertProvider>
            <Suspense>
              <AppLoginPopupProvider>
                <ThemeProvider attribute="data-theme">
                  {children}
                </ThemeProvider>
              </AppLoginPopupProvider>
            </Suspense>
          </AppAlertProvider>
        </AppConfirmProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
};

export default CommonProviders;
