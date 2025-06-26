import { persistenceRepository } from "@/backend/persistence/persistence-repositories";

import type { MetadataRoute } from "next";
import { and, eq, neq } from "sqlkit";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await persistenceRepository.article.find({
    where: and(neq("published_at", null), neq("approved_at", null)),
    columns: ["handle", "updated_at"],
    limit: -1,
    joins: [
      {
        as: "user",
        table: "users",
        type: "left",
        on: {
          localField: "author_id",
          foreignField: "id",
        },
        columns: ["id", "username"],
      },
    ],
  });

  return articles
    .filter((article) => article?.handle)
    .map((article) => {
      let url = "null";
      if (article?.handle) {
        url = `https://www.techdiary.dev/@${article.user?.username}/${article?.handle}`;
      }

      return {
        url,
        lastModified: article?.updated_at,
        changeFrequency: "weekly",
        priority: 1,
      };
    });
}
