"use client";

import type { ThemePreference } from "@/lib/theme-cookie";
import { tanstackQueryClient } from "@/lib/tanstack-query.client";
import { QueryClientProvider } from "@tanstack/react-query";
import React, { PropsWithChildren, Suspense } from "react";

import { jotaiStore } from "@/store/store";
import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "./theme-provider";
import { AppConfirmProvider } from "../app-confirm";
import { AppAlertProvider } from "../app-alert";
import { AppLoginPopupProvider } from "../app-login-popup";
import { RealtimeProvider } from "./RealtimeProvider";

type Props = PropsWithChildren<{
  initialTheme?: ThemePreference;
  /** When true, one-time migration from legacy `localStorage.theme` via server action. */
  migrateThemeFromLocalStorage?: boolean;
}>;

const CommonProviders: React.FC<Props> = ({
  children,
  initialTheme = "system",
  migrateThemeFromLocalStorage = false,
}) => {
  return (
    <JotaiProvider store={jotaiStore}>
      <QueryClientProvider client={tanstackQueryClient}>
        <AppConfirmProvider>
          <AppAlertProvider>
            <Suspense>
              <AppLoginPopupProvider>
                <ThemeProvider
                  initialTheme={initialTheme}
                  migrateThemeFromLocalStorage={migrateThemeFromLocalStorage}
                >
                  <RealtimeProvider>{children}</RealtimeProvider>
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
