"use client";

import { listGists } from "@/backend/services/gist.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import VisibilitySensor from "@/components/VisibilitySensor";
import { actionPromisify, formattedTime } from "@/lib/utils";
import getFileUrl from "@/utils/getFileUrl";
import {
  EyeOpenIcon,
  LockClosedIcon,
  PlusIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GistListProps {
  userId?: string;
  isPublic?: boolean;
  showCreateButton?: boolean;
}

export default function GistList({ 
  userId, 
  isPublic, 
  showCreateButton = true 
}: GistListProps) {
  const router = useRouter();

  const gistsQuery = useInfiniteQuery({
    queryKey: ["gists", { userId, isPublic }],
    queryFn: ({ pageParam = 0 }) =>
      actionPromisify(listGists({
        user_id: userId,
        is_public: isPublic,
        limit: 10,
        offset: pageParam * 10,
      })),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 10) return undefined;
      return allPages.length;
    },
  });

  const gists = gistsQuery.data?.pages.flat() || [];

  if (gistsQuery.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (gistsQuery.isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-4">Failed to load gists</p>
          <Button
            variant="outline"
            onClick={() => gistsQuery.refetch()}
            className="flex items-center gap-2"
          >
            <ReloadIcon className="w-4 h-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gists.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-lg">No gists found</p>
            {showCreateButton && (
              <Button onClick={() => router.push("/gists/new")}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Your First Gist
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showCreateButton && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gists</h2>
          <Button onClick={() => router.push("/gists/new")}>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Gist
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {gists.map((gist) => (
          <Card key={gist.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/gists/${gist.id}`}
                      className="hover:underline"
                    >
                      <CardTitle className="text-xl">{gist.title}</CardTitle>
                    </Link>
                    <Badge variant={gist.is_public ? "default" : "secondary"}>
                      {gist.is_public ? (
                        <>
                          <EyeOpenIcon className="w-3 h-3 mr-1" />
                          Public
                        </>
                      ) : (
                        <>
                          <LockClosedIcon className="w-3 h-3 mr-1" />
                          Private
                        </>
                      )}
                    </Badge>
                  </div>

                  {gist.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {gist.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {gist.owner && (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage 
                            src={gist.owner.profile_photo ? getFileUrl(gist.owner.profile_photo) : undefined}
                            alt={gist.owner.name} 
                          />
                          <AvatarFallback>
                            {gist.owner.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{gist.owner.name}</span>
                      </div>
                    )}
                    <span>Created {formattedTime(gist.created_at)}</span>
                    {gist.files && (
                      <span>{gist.files.length} file{gist.files.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            {gist.files && gist.files.length > 0 && (
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {gist.files.slice(0, 3).map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded"
                    >
                      <span className="font-mono">{file.filename}</span>
                      {file.language && (
                        <Badge variant="outline" className="text-xs">
                          {file.language}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {gist.files.length > 3 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">
                      +{gist.files.length - 3} more
                    </span>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {gistsQuery.hasNextPage && (
          <div className="flex justify-center py-4">
            <VisibilitySensor
              visible={gistsQuery.hasNextPage}
              onLoadmore={() => gistsQuery.fetchNextPage()}
            />
            {gistsQuery.isFetchingNextPage ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <ReloadIcon className="w-4 h-4 animate-spin" />
                Loading more gists...
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => gistsQuery.fetchNextPage()}
              >
                Load More
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}