import {
  getGist,
  getPublicGistCached,
} from "@/backend/services/gist.actions";
import { authID } from "@/backend/services/session.actions";
import GistEditor from "@/components/Gist/GistEditor";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

interface EditGistPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditGistPageProps): Promise<Metadata> {
  const { id } = await params;
  const gist = await getPublicGistCached(id);

  return {
    title: gist ? `Edit: ${gist.title} — Techdiary` : "Edit Gist — Techdiary",
    robots: { index: false },
  };
}

export default async function EditGistPage({ params }: EditGistPageProps) {
  const { id } = await params;

  const [result, sessionUserId] = await Promise.all([
    getGist({ id }),
    authID(),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const gist = result.data;

  if (!sessionUserId || sessionUserId !== gist.owner_id) {
    redirect(`/gists/${id}`);
  }

  return <GistEditor gist={gist} />;
}
