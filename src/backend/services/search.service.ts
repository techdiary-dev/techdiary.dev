import {
  algoliaAdminClient,
  ARTICLES_INDEX,
} from "@/lib/algolia.admin.client";
import { and, eq, neq } from "sqlkit";
import { persistenceRepository } from "../persistence/persistence-repositories";

// Algolia free records are 10KB. Keep body for relevance, drop the rest.
const BODY_INDEX_LIMIT = 4000;

function toRecord(article: {
  id: string;
  title?: string | null;
  body?: string | null;
  handle?: string | null;
  cover_image?: unknown;
  user?: unknown;
}) {
  return {
    objectID: article.id,
    id: article.id,
    title: article.title ?? "",
    handle: article.handle ?? "",
    body: (article.body ?? "").slice(0, BODY_INDEX_LIMIT),
    cover_image: article.cover_image ?? null,
    user: article.user ?? null,
  };
}

/**
 * Sync all articles to the search index
 * @returns The number of articles synced
 */
export const syncAllArticles = async () => {
  try {
    const articles = await persistenceRepository.article.find({
      columns: ["id", "title", "body", "handle", "cover_image"],
      where: and(neq("published_at", null), neq("approved_at", null)),
      joins: [
        {
          as: "user",
          type: "left",
          table: "users",
          on: {
            localField: "author_id",
            foreignField: "id",
          },
          columns: ["id", "name", "username"],
        },
      ],
    });

    const syncArticle = await algoliaAdminClient.saveObjects({
      indexName: ARTICLES_INDEX,
      objects: articles.map(toRecord),
    });

    console.log({ syncArticle });

    return {
      message: "Articles synced successfully",
      count: articles.length,
      timestamp: new Date().toISOString(),
      index: ARTICLES_INDEX,
    };
  } catch (error) {
    console.error("Error syncing articles:", error);
  }
};

/**
 * Sync an article by its ID
 * @param articleId - The ID of the article to sync
 * @returns The article that was synced
 */
export const syncArticleById = async (articleId: string) => {
  try {
    const [article] = await persistenceRepository.article.find({
      columns: ["id", "title", "body", "cover_image", "handle"],
      limit: 1,
      where: and(eq("id", articleId), neq("published_at", null)),
      joins: [
        {
          as: "user",
          type: "left",
          table: "users",
          on: {
            localField: "author_id",
            foreignField: "id",
          },
          columns: ["id", "name", "username"],
        },
      ],
    });

    if (!article) {
      throw new Error(
        `Article with ID ${articleId} not found or not published.`,
      );
    }

    const syncArticleByIdRes = await algoliaAdminClient.saveObjects({
      indexName: ARTICLES_INDEX,
      objects: [toRecord(article)],
    });

    console.log({ syncArticleByIdRes, article });

    return {
      message: `Article ${articleId} synced successfully`,
      article,
      timestamp: new Date().toISOString(),
      index: ARTICLES_INDEX,
    };
  } catch (error) {
    console.error(`Error syncing article ${articleId}:`, error);
  }
};

export const deleteArticleById = async (articleId: string) => {
  try {
    const response = await algoliaAdminClient.deleteObject({
      indexName: ARTICLES_INDEX,
      objectID: articleId,
    });
    console.log(`Article ${articleId} deleted successfully`);
    return {
      message: `Article ${articleId} deleted successfully`,
      response,
      timestamp: new Date().toISOString(),
      index: ARTICLES_INDEX,
    };
  } catch (error) {
    console.error(`Error deleting article ${articleId}:`, error);
  }
};
