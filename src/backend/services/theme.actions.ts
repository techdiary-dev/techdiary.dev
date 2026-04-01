"use server";

import {
  THEME_COOKIE_NAME,
  THEME_COOKIE_MAX_AGE,
  type ThemePreference,
} from "@/lib/theme-cookie";
import { env } from "@/env";
import { cookies } from "next/headers";
import { z } from "zod/v4";

const themeSchema = z.enum(["light", "dark", "system"]);

export async function setThemePreference(
  pref: ThemePreference,
): Promise<{ ok: true } | { ok: false }> {
  const parsed = themeSchema.safeParse(pref);
  if (!parsed.success) return { ok: false };
  try {
    const store = await cookies();
    store.set(THEME_COOKIE_NAME, parsed.data, {
      path: "/",
      maxAge: THEME_COOKIE_MAX_AGE,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
    });
  } catch {
    return { ok: false };
  }
  return { ok: true };
}
