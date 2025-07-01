"use client";

import { getGist } from "@/backend/services/gist.actions";
import GistViewer from "@/components/Gist/GistViewer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { actionPromisify } from "@/lib/utils";
import { useSession } from "@/store/session.atom";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";

interface GistPageProps {
  params: {
    id: string;
  };
}

export default function GistPage({ params }: GistPageProps) {
  const session = useSession();
  
  const gistQuery = useQuery({
    queryKey: ["gist", params.id],
    queryFn: () => actionPromisify(getGist({ id: params.id })),
  });

  if (gistQuery.isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gistQuery.isError || !gistQuery.data) {
    notFound();
  }

  const gist = gistQuery.data;
  const isOwner = session?.user?.id === gist.owner_id;

  return <GistViewer gist={gist} isOwner={isOwner} />;
}