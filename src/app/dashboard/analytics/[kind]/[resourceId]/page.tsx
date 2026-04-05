import { ResourceAnalyticsDashboard } from "@/components/analytics/ResourceAnalyticsDashboard";
import type { TrackedResourceType } from "@/backend/services/inputs/analytics.input";
import { persistenceRepository } from "@/backend/persistence/persistence-repositories";
import { DatabaseTableName } from "@/backend/persistence/persistence-contracts";
import * as sessionActions from "@/backend/services/session.actions";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "sqlkit";
import { z } from "zod/v4";

const KIND_MAP: Record<string, TrackedResourceType> = {
  article: "ARTICLE",
  gist: "GIST",
};

interface Props {
  params: Promise<{ kind: string; resourceId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind, resourceId } = await params;
  const resourceType = KIND_MAP[kind];
  if (!resourceType || !z.string().uuid().safeParse(resourceId).success) {
    return { title: "Analytics" };
  }

  const userId = await sessionActions.authID();
  if (!userId) {
    return { title: "Analytics" };
  }

  if (kind === "article") {
    const [row] = await persistenceRepository.article.find({
      limit: 1,
      columns: ["title"],
      where: and(eq("id", resourceId), eq("author_id", userId)),
    });
    return {
      title: row?.title ? `${row.title} — Analytics` : "Article analytics",
    };
  }

  if (kind === "gist") {
    const [row] = await persistenceRepository.gist.find({
      limit: 1,
      columns: ["title"],
      where: and(eq("id", resourceId), eq("owner_id", userId)),
    });
    return {
      title: row?.title ? `${row.title} — Analytics` : "Gist analytics",
    };
  }

  return { title: "Analytics" };
}

export default async function ResourceAnalyticsPage({ params }: Props) {
  const { kind, resourceId } = await params;

  const resourceType = KIND_MAP[kind];
  if (!resourceType) {
    notFound();
  }

  if (!z.string().uuid().safeParse(resourceId).success) {
    notFound();
  }

  const sessionUserId = await sessionActions.authID();
  if (!sessionUserId) {
    redirect(`/login?next=/dashboard/analytics/${kind}/${resourceId}`);
  }

  let resourceTitle: string | null = null;
  let publicReaderHref: string | null = null;
  const backHref =
    kind === "article"
      ? `/dashboard/articles/${resourceId}`
      : `/gists/${resourceId}/edit`;

  if (kind === "article") {
    const [article] = await persistenceRepository.article.find({
      limit: 1,
      columns: ["title", "handle"],
      where: and(eq("id", resourceId), eq("author_id", sessionUserId)),
      joins: [
        {
          as: "user",
          table: DatabaseTableName.users,
          type: "left",
          on: {
            localField: "author_id",
            foreignField: "id",
          },
          columns: ["username"],
        },
      ],
    });
    if (!article) {
      notFound();
    }
    resourceTitle = article.title;
    const username = article.user?.username;
    if (username && article.handle) {
      publicReaderHref = `/${username}/${article.handle}`;
    }
  } else {
    const [gist] = await persistenceRepository.gist.find({
      limit: 1,
      columns: ["title", "is_public"],
      where: and(eq("id", resourceId), eq("owner_id", sessionUserId)),
    });
    if (!gist) {
      notFound();
    }
    resourceTitle = gist.title;
    if (gist.is_public) {
      publicReaderHref = `/gists/${resourceId}`;
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <Link
        href={backHref}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {kind === "gist" ? "Gist analytics" : "Article analytics"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {kind === "gist"
            ? "Reach and engagement for this gist."
            : "Reach and engagement for this article."}
        </p>
      </div>
      <ResourceAnalyticsDashboard
        resourceType={resourceType}
        resourceId={resourceId}
        resourceTitle={resourceTitle}
        publicReaderHref={publicReaderHref}
      />
    </div>
  );
}
