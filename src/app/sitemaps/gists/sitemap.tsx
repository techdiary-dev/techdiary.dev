import { pgClient } from "@/backend/persistence/clients";
import type { MetadataRoute } from "next";

const sql = String.raw;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result = await pgClient.executeSQL<{ id: string; updated_at: Date }>(
    sql`SELECT id, updated_at FROM gists WHERE is_public = true ORDER BY updated_at DESC`,
    []
  );

  return (result?.rows ?? []).map((gist) => ({
    url: `https://www.techdiary.dev/gists/${gist.id}`,
    lastModified: gist.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
}
