import { cn } from "@/lib/utils";
import { Book } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface SeriesCardProps {
  id: string;
  handle: string;
  title: string;
  description?: string;
  coverImage?: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
    username: string;
  };
  articleCount: number;
  className?: string;
}

const SeriesCard = ({
  id,
  handle,
  title,
  description,
  coverImage,
  creator,
  articleCount,
  className,
}: SeriesCardProps) => {
  const seriesUrl = `/series/${handle}`;
  const creatorUrl = `/@${creator.username}`;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="relative aspect-[16/9] sm:aspect-square h-48 sm:h-full">
          {coverImage ? (
            <Link href={seriesUrl}>
              <Image
                fill
                src={coverImage}
                alt={title}
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </Link>
          ) : (
            <Link href={seriesUrl}>
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                <Book size={48} className="text-primary/50" />
              </div>
            </Link>
          )}
        </div>

        <div className="sm:col-span-2 p-4 flex flex-col">
          <Link href={seriesUrl} className="mb-2 hover:underline">
            <h2 className="text-xl font-semibold line-clamp-2">{title}</h2>
          </Link>

          {description && (
            <p className="text-muted-foreground line-clamp-2 mb-4">
              {description}
            </p>
          )}

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {articleCount} {articleCount === 1 ? "article" : "articles"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href={creatorUrl}
                className="flex items-center gap-2 hover:underline"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={creator.avatar} alt={creator.name} />
                  <AvatarFallback>
                    {creator.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{creator.name}</span>
              </Link>

              <Button variant="outline" size="sm" asChild>
                <Link href={seriesUrl}>View Series</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SeriesCard;
