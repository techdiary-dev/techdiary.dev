import { ActionResponse } from "@/backend/models/action-contracts";
import { clsx, type ClassValue } from "clsx";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import { z } from "zod/v4";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateRandomString = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
};

export const zodErrorToString = (err: z.ZodError) => {
  return err.issues.reduce((acc: string, curr: any) => {
    return acc + curr.message + "\n";
  }, "");
};

/** Prefer stored excerpt when non-empty; otherwise derive from markdown body. */
export function resolveArticleExcerpt(
  excerpt: string | null | undefined,
  body: string | null | undefined,
  words_count = 65
): string {
  const trimmed = excerpt?.trim();
  if (trimmed) return trimmed;
  return removeMarkdownSyntax(body, words_count) ?? "";
}

export function removeMarkdownSyntax(md?: string | null, words_count = 65) {
  return md
    ?.replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
    ?.replace(/\[([^\]]+)\]\((.*?)\)/g, "$1") // Remove links but keep text
    ?.replace(/`{1,3}([^`]+)`{1,3}/g, "$1") // Remove inline code
    ?.replace(/(\*\*|__)(.*?)\1/g, "$2") // Remove bold
    ?.replace(/(\*|_)(.*?)\1/g, "$2") // Remove italic
    ?.replace(/~~(.*?)~~/g, "$1") // Remove strikethrough
    ?.replace(/#+\s*(.*)/g, "$1") // Remove headings
    ?.replace(/>\s*(.*)/g, "$1") // Remove blockquotes
    ?.replace(/- \[ \] /g, "") // Remove task list (unchecked)
    ?.replace(/- \[x\] /g, "") // Remove task list (checked)
    ?.replace(/[-*+]\s+/g, "") // Remove bullet points
    ?.replace(/\d+\.\s+/g, "") // Remove numbered lists
    ?.replace(/```[\s\S]*?```/g, "") // Remove code blocks
    ?.replace(/`/g, "") // Remove remaining inline code
    ?.replace(/\n{2,}/g, "\n") // Remove extra newlines
    ?.trim()
    .split(" ")
    .slice(0, words_count)
    .join(" ");
}

export function extractImageUrlsFromMarkdown(markdown: string): string[] {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const urls: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = imageRegex.exec(markdown)) !== null) {
    if (match[1]) {
      urls.push(match[1]);
    }
  }

  return urls;
}

const OG_IMAGE_SKIP = new Set(["uploading", "error"]);

/**
 * First usable image URL from `![](url)` markdown for Open Graph / JSON-LD.
 * Strips optional markdown titles, resolves site-relative paths with `siteOrigin`.
 */
export function getFirstOgImageUrlFromMarkdown(
  markdown: string | null | undefined,
  siteOrigin = "https://www.techdiary.dev",
): string | undefined {
  if (!markdown?.trim()) return undefined;
  for (const raw of extractImageUrlsFromMarkdown(markdown)) {
    let href = raw.trim().split(/\s+/)[0] ?? "";
    href = href.replace(/^<|>$/g, "").trim();
    if (!href || OG_IMAGE_SKIP.has(href)) continue;
    if (href.startsWith("data:")) continue;
    if (href.startsWith("http://") || href.startsWith("https://")) return href;
    if (href.startsWith("//")) return `https:${href}`;
    if (href.startsWith("/")) return `${siteOrigin}${href}`;
  }
  return undefined;
}

export function readingTime(text: string) {
  const wordsPerMinute = 200;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const textWithoutPunctuation = trimmed.replace(/[.,!?;:]/g, "");
  const wordCount = textWithoutPunctuation.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / wordsPerMinute));
  return minutes;
}

export const formattedTime = (date: Date, lang: "bn" | "en" | null = "en") => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Intl.DateTimeFormat(`${lang}-BD`, options).format(date);
};

export const formattedRelativeTime = (
  date: Date,
  lang: "bn" | "en" | null = "en"
) => {
  const rtf1 = new Intl.RelativeTimeFormat(lang ?? "en", { style: "short" });
  return rtf1.format(
    Math.round(Math.abs(date.getTime() - new Date().getTime()) / 1000),
    "second"
  );
};

export const sanitizedUsername = (username: string) => {
  // Decode URL-encoded characters (like %40 to @)
  const decoded = decodeURIComponent(username);

  return decoded.startsWith("@") || decoded.startsWith("/@")
    ? decoded.replace(/[@/]/g, "").toLowerCase()
    : decoded.toLowerCase();
};

export const getImageBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const removeUndefinedFromObject = (obj: any) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach((key) => {
    if (newObj[key] === undefined) {
      delete newObj[key];
    }
  });
  return newObj;
};

export function filterUndefined<T = unknown>(
  mapping: Partial<Record<keyof T, any>>
): Partial<Record<string, any>> {
  return Object.fromEntries(
    Object.entries(mapping).filter(([_, value]) => value !== undefined)
  ) as Partial<Record<string, any>>;
}

// Improved with automatic type inference
export const actionPromisify = async <T = any>(
  action: Promise<ActionResponse<T>>,
  options?: {
    enableToast?: boolean;
    toastOptions?: {
      loading?: string;
      success?: string;
      error?: string;
    };
  }
): Promise<T> => {
  const promise = new Promise<T>(async (resolve, reject) => {
    try {
      const resolvedAction = await action;

      if (!resolvedAction) {
        reject("Action returned undefined");
        return;
      }

      if (!resolvedAction.success) {
        // @ts-ignore
        reject(resolvedAction.error ?? "Unknown error occurred");
        return;
      }

      if (resolvedAction.success) {
        resolve(resolvedAction.data);
        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        reject(error.message);
      } else {
        reject("An unexpected error occurred");
      }
    }
  });

  if (options?.enableToast) {
    toast.promise(promise, {
      loading: options?.toastOptions?.loading ?? "Loading...",
      success: options?.toastOptions?.success ?? "Success!",
      error: (errorMsg: string) => errorMsg || "Operation failed",
    });
  }

  return promise;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(() => resolve("Hello"), ms));

export const getAvatarPlaceholder = (name: string) => {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${name}`;
};
