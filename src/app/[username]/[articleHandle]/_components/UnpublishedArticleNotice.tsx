"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/use-translation";
import { useSession } from "@/store/session.atom";
import { FileWarning } from "lucide-react";

type Props = {
  publishedAt: Date | null | undefined;
  authorId: string;
};

/** Inline reading time label for the article byline. */
export function ArticleReadingTime({ minutes }: { minutes: number }) {
  const { _t } = useTranslation();
  return <span>{_t("$ min read", [minutes])}</span>;
}

/** Inline label next to the byline date when the article has no `published_at`. */
export function ArticleDraftBylineLabel() {
  const { _t } = useTranslation();
  return (
    <span className="font-medium text-amber-700 dark:text-amber-400">
      {_t("Draft")}
    </span>
  );
}

export function UnpublishedArticleNotice({ publishedAt, authorId }: Props) {
  const { _t } = useTranslation();
  const session = useSession();

  if (publishedAt) return null;

  const viewerId = session?.session?.user_id;
  const isAuthor = Boolean(viewerId) && viewerId === authorId;

  return (
    <div
      role="alert"
      className="mb-4 flex flex-col gap-2 rounded-lg border border-amber-500/45 bg-amber-500/12 px-4 py-3 text-sm dark:border-amber-400/40 dark:bg-amber-400/12"
    >
      <div className="flex flex-wrap items-center gap-2">
        <FileWarning
          className="size-4 shrink-0 text-amber-800 dark:text-amber-300"
          aria-hidden
        />
        <Badge
          variant="outline"
          className="border-amber-700/45 text-amber-950 dark:border-amber-300/50 dark:text-amber-50"
        >
          {_t("Draft")}
        </Badge>
        <span className="font-semibold text-amber-950 dark:text-amber-50">
          {_t("Unpublished article")}
        </span>
      </div>
      <p className="text-pretty pl-6 text-amber-950/85 dark:text-amber-50/90">
        {isAuthor
          ? _t(
              "This draft is not listed anywhere on the site. Only people with the link can open it. Publish from the editor when you want it on your profile and in feeds.",
            )
          : _t(
              "This article is unpublished. It is not listed on the site; only people with this link can view it.",
            )}
      </p>
    </div>
  );
}
