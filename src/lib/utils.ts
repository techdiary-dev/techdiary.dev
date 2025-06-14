import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z, ZodAnyDef, ZodObject } from "zod";

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
  return err.errors.reduce((acc, curr) => {
    return acc + curr.message + "\n";
  }, "");
};

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

export function readingTime(text: string) {
  const wordsPerMinute = 120;
  const textWithoutPunctuation = text.replace(/[.,!?;:]/g, "");
  const wordCount = textWithoutPunctuation.split(/\s+/).length;
  const minutes = Math.round(wordCount / wordsPerMinute);
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

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const removeNullOrUndefinedFromObject = (obj: any) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach((key) => {
    if (newObj[key] === null || newObj[key] === undefined) {
      delete newObj[key];
    }
  });
  return newObj;
};

export function filterUndefined<T>(
  mapping: Partial<Record<keyof T, any>>
): Partial<Record<string, any>> {
  return Object.fromEntries(
    Object.entries(mapping).filter(([_, value]) => value !== undefined)
  ) as Partial<Record<string, any>>;
}
