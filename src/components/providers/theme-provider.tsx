"use client";

import { setThemePreference } from "@/backend/services/theme.actions";
import * as React from "react";

import { type ThemePreference } from "@/lib/theme-cookie";

export type { ThemePreference };

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(pref: ThemePreference): "light" | "dark" {
  if (pref === "system") return getSystemTheme();
  return pref;
}

function applyToDocument(resolved: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.style.colorScheme = resolved;
}

export type ThemeContextValue = {
  theme: ThemePreference;
  setTheme: (t: ThemePreference) => void;
  resolvedTheme: "light" | "dark";
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

type ThemeProviderProps = {
  children: React.ReactNode;
  initialTheme: ThemePreference;
  migrateThemeFromLocalStorage: boolean;
};

export function ThemeProvider({
  children,
  initialTheme,
  migrateThemeFromLocalStorage,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemePreference>(initialTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(
    "light",
  );

  React.useEffect(() => {
    setThemeState(initialTheme);
    const resolved = resolveTheme(initialTheme);
    setResolvedTheme(resolved);
    applyToDocument(resolved);
  }, [initialTheme]);

  React.useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyToDocument(resolved);
  }, [theme]);

  React.useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const resolved = resolveTheme("system");
      setResolvedTheme(resolved);
      applyToDocument(resolved);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  React.useEffect(() => {
    if (!migrateThemeFromLocalStorage) return;
    try {
      const v = localStorage.getItem("theme");
      if (v !== "light" && v !== "dark" && v !== "system") return;
      void setThemePreference(v).then((r) => {
        if (r.ok) setThemeState(v);
      });
    } catch {
      /* private mode */
    }
  }, [migrateThemeFromLocalStorage]);

  const setTheme = React.useCallback((t: ThemePreference) => {
    setThemeState(t);
    void setThemePreference(t);
  }, []);

  const value = React.useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
