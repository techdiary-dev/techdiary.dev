"use client";

import { toast } from "@/components/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/i18n/use-translation";
import clsx from "clsx";
import { Share2 } from "lucide-react";
import React, { useMemo } from "react";

interface ArticleShareButtonProps {
  url: string;
  title: string;
}

const triggerClass = clsx(
  "transition-colors duration-300 flex cursor-pointer px-2 py-1 rounded-sm hover:bg-primary/20",
);

const ArticleShareButton: React.FC<ArticleShareButtonProps> = ({
  url,
  title,
}) => {
  const { _t } = useTranslation();

  const twitterHref = useMemo(() => {
    const params = new URLSearchParams({ text: title, url });
    return `https://twitter.com/intent/tweet?${params.toString()}`;
  }, [title, url]);

  const facebookHref = useMemo(() => {
    const params = new URLSearchParams({ u: url });
    return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
  }, [url]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(_t("Link copied"));
    } catch {
      toast.error(_t("Could not copy link"));
    }
  };

  /** Web Share when available; otherwise copy (desktop menu stays one consistent shape for SSR). */
  const shareNativeOrCopy = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch (err) {
        const name = err instanceof Error ? err.name : "";
        if (name === "AbortError") return;
      }
    }
    await copyToClipboard();
  };

  const handleMobileTap = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch (err) {
        const name = err instanceof Error ? err.name : "";
        if (name === "AbortError") return;
      }
    }
    await copyToClipboard();
  };

  return (
    <>
      <div className="md:hidden">
        <button
          type="button"
          onClick={handleMobileTap}
          className={triggerClass}
          aria-label={_t("Share")}
          title={_t("Share")}
        >
          <Share2 className="size-5 stroke-2" aria-hidden />
        </button>
      </div>

      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={clsx(triggerClass, "outline-none")}
            aria-label={_t("Share")}
            title={_t("Share")}
            aria-haspopup="menu"
          >
            <Share2 className="size-5 stroke-2" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            <DropdownMenuItem onSelect={() => void copyToClipboard()}>
              {_t("Copy link")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void shareNativeOrCopy()}>
              {_t("Share")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a
                href={twitterHref}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                {_t("Share on Twitter")}
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={facebookHref}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                {_t("Share on Facebook")}
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default ArticleShareButton;
