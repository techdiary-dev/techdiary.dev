"use client";

import { useTranslation } from "@/i18n/use-translation";
import { formattedTime, getAvatarPlaceholder } from "@/lib/utils";
import { VerifiedIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import ResourceBookmark from "./ResourceBookmark";
import ResourceReaction from "./ResourceReaction";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import UserInformationCard from "./UserInformationCard";

interface ArticleCardProps {
  id: string;
  title: string;
  handle: string;
  excerpt: string;
  coverImage?: string;
  galleryImages?: string[];
  author: {
    id: string;
    name: string;
    avatar: string;
    username: string;
    is_verified: boolean;
  };
  publishedAt: string;
  readingTime: number;
}

const ArticleCard = ({
  id,
  title,
  handle,
  excerpt,
  coverImage,
  author,
  publishedAt,
  readingTime,
  galleryImages,
}: ArticleCardProps) => {
  const { lang } = useTranslation();

  const articleUrl = useMemo(() => {
    return `/@${author.username}/${handle}`;
  }, [author.username, handle]);

  return (
    <div data-article-id={id} className="flex flex-col p-4 sm:p-5 group">
      <div className="mb-4 flex items-center">
        <HoverCard openDelay={0}>
          <HoverCardTrigger asChild>
            <div className="relative rounded-full overflow-hidden border border-neutral-200 bg-neutral-100 transition-transform duration-300 size-8 opacity-100 cursor-pointer">
              <Image
                width={32}
                height={32}
                unoptimized
                src={
                  Boolean(author.avatar)
                    ? author.avatar
                    : getAvatarPlaceholder(author.name)
                }
                alt={author.name ?? ""}
                className="w-full h-full object-cover transition-opacity duration-300 ease-in-out opacity-100"
              />
            </div>
          </HoverCardTrigger>
          <HoverCardContent align="start">
            <UserInformationCard userId={author.id} />
          </HoverCardContent>
        </HoverCard>
        <div className="ml-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/@${author.username}`}
              className="text-sm font-medium text-foreground"
            >
              {author.name}
            </Link>
            {author?.is_verified && (
              <VerifiedIcon className="size-4 fill-primary" />
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <time dateTime={publishedAt.toString()}>
              {formattedTime(new Date(publishedAt), lang)}
            </time>
            <span className="mx-1.5">·</span>
            <span>{readingTime} min read</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col space-y-2 mb-3">
          <Link
            href={articleUrl}
            className="text-lg font-bold text-foreground group-hover:text-primary group-hover:underline transition-colors duration-200"
          >
            {title}...
          </Link>
          <p className="text-sm text-muted-foreground">
            {excerpt} [<Link href={articleUrl}>Read more</Link>]
          </p>
        </div>

        {coverImage && (
          <Link href={articleUrl} className="block">
            <div className="relative mt-4 overflow-hidden rounded-md aspect-[16/9]">
              <Image
                src={coverImage}
                alt={title}
                width={1200}
                height={630}
                className="h-full w-full object-cover transition-all duration-700 opacity-100 scale-100"
              />
            </div>
          </Link>
        )}

        <div className="grid gap-2 grid-cols-2  auto-rows-auto">
          {galleryImages?.map((image) => (
            <Link
              key={image}
              href={articleUrl}
              className="relative rounded-sm overflow-hidden group cursor-pointer"
            >
              <img
                src={image}
                alt={title}
                className="w-full h-auto object-cover"
              />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <ResourceReaction resource_type="ARTICLE" resource_id={id} />
        <ResourceBookmark resource_type="ARTICLE" resource_id={id} />
      </div>
    </div>
  );
};

export default ArticleCard;
