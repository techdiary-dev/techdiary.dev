import { THEME_COOKIE_NAME, parseThemePreference } from "@/lib/theme-cookie";
import { cookies } from "next/headers";
import type { PropsWithChildren } from "react";
import CommonProviders from "./CommonProviders";

/**
 * Reads theme cookie on the server and passes it into the client provider tree.
 * Must render inside `<Suspense>` when using Cache Components.
 */
export default async function RootProviders({ children }: PropsWithChildren) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME);
  const initialTheme = parseThemePreference(themeCookie?.value);
  const themeCookieMissing = themeCookie === undefined;

  return (
    <CommonProviders
      initialTheme={initialTheme}
      migrateThemeFromLocalStorage={themeCookieMissing}
    >
      {children}
    </CommonProviders>
  );
}
