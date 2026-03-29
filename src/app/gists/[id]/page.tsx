import {
  getGist,
  getPublicGistCached,
} from "@/backend/services/gist.actions";
import { authID } from "@/backend/services/session.actions";
import GistViewer from "@/components/Gist/GistViewer";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface GistPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: GistPageProps): Promise<Metadata> {
  const { id } = await params;
  const gist = await getPublicGistCached(id);

  if (!gist) {
    return { title: "Gist — Techdiary" };
  }

  return {
    title: `${gist.title} — Techdiary`,
    description: gist.description ?? undefined,
    openGraph: {
      title: gist.title,
      description: gist.description ?? undefined,
      url: `https://www.techdiary.dev/gists/${id}`,
      type: "website",
    },
  };
}

export default async function GistPage({ params }: GistPageProps) {
  const { id } = await params;

  const [result, sessionUserId] = await Promise.all([
    getGist({ id }),
    authID(),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const gist = result.data;
  const isOwner = sessionUserId === gist.owner_id;

  return <GistViewer gist={gist} isOwner={isOwner} />;
}
