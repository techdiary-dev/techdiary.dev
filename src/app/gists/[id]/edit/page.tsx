"use client";

import { getGist } from "@/backend/services/gist.actions";
import GistEditor from "@/components/Gist/GistEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { actionPromisify } from "@/lib/utils";
import { useSession } from "@/store/session.atom";
import { useQuery } from "@tanstack/react-query";
import { notFound, useRouter } from "next/navigation";
import { useEffect } from "react";

interface EditGistPageProps {
  params: { id: string };
}

export default function EditGistPage({ params }: EditGistPageProps) {
  const session = useSession();
  const router = useRouter();

  const gistQuery = useQuery({
    queryKey: ["gist", params.id],
    queryFn: () => actionPromisify(getGist({ id: params.id })),
  });

  // Redirect if not owner
  useEffect(() => {
    if (gistQuery.data && session?.user?.id !== gistQuery.data.owner_id) {
      router.push(`/gists/${params.id}`);
    }
  }, [gistQuery.data, session?.user?.id, router, params.id]);

  if (gistQuery.isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gistQuery.isError || !gistQuery.data) {
    notFound();
  }

  const gist = gistQuery.data;

  // Don't render if not owner (will redirect)
  if (session?.user?.id !== gist.owner_id) {
    return null;
  }

  return (
    <GistEditor
      gist={gist}
      onSuccess={(gistId) => router.push(`/gists/${gistId}`)}
    />
  );
}
