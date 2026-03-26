import { pgClient } from "@/backend/persistence/clients";
import type { MetadataRoute } from "next";

const sql = String.raw;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result = await pgClient.executeSQL(
    sql`
      SELECT DISTINCT u.username, u.updated_at
      FROM users u
      INNER JOIN articles a ON a.author_id = u.id
      WHERE a.published_at IS NOT NULL AND a.approved_at IS NOT NULL
    `,
    []
  );

  return (result?.rows ?? []).map((profile: any) => ({
    url: `https://www.techdiary.dev/@${profile.username}`,
    lastModified: profile.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));
}
