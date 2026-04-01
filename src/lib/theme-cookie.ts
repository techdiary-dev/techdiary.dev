export const THEME_COOKIE_NAME = "theme";

/** 1 year — matches typical “remember preference” behavior. */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type ThemePreference = "light" | "dark" | "system";

export function parseThemePreference(
  raw: string | undefined | null,
): ThemePreference {
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "system";
}
