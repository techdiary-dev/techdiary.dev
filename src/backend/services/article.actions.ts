"use server";

import { slugify } from "@/lib/slug-helper.util";
import {
  removeMarkdownSyntax,
  removeNullOrUndefinedFromObject,
} from "@/lib/utils";
import { addDays } from "date-fns";
import * as sk from "sqlkit";
import { and, desc, eq, like, neq, or } from "sqlkit";
import { z } from "zod";
import { ActionResponse } from "../models/action-contracts";
import { Article, User } from "../models/domain-models";
import { DatabaseTableName } from "../persistence/persistence-contracts";
import { persistenceRepository } from "../persistence/persistence-repositories";
import { ActionException, handleActionException } from "./RepositoryException";
import { ArticleRepositoryInput } from "./inputs/article.input";
import { deleteArticleById, syncArticleById } from "./search.service";
import { authID } from "./session.actions";
import { syncTagsWithArticles } from "./tag.action";

export async function createMyArticle(
  _input: z.infer<typeof ArticleRepositoryInput.createMyArticleInput>
) {
  try {
    const sessionUserId = await authID();
    if (!sessionUserId) {
      throw new ActionException("Unauthorized");
    }

    const input =
      await ArticleRepositoryInput.createMyArticleInput.parseAsync(_input);

    // Default to "untitled" if title is empty
    const titleToUse = input.title?.trim() || "Untitled Article";

    // Generate a unique handle based on the title
    const handle = await getUniqueArticleHandle(titleToUse);

    if (!handle) {
      throw new ActionException(
        "Failed to generate a unique handle for the article"
      );
    }

    const article = await persistenceRepository.article.insert([
      {
        title: input.title,
        handle: handle,
        excerpt: input.excerpt ?? null,
        body: input.body ?? null,
        cover_image: input.cover_image ?? null,
        is_published: input.is_published ?? false,
        published_at: input.is_published ? new Date() : null,
        author_id: sessionUserId,
      },
    ]);
    return article?.rows?.[0];
  } catch (error) {
    console.error("Article creation error:", error);
    handleActionException(error);
    return null;
  }
}

export const getUniqueArticleHandle = async (
  title: string,
  ignoreArticleId?: string
) => {
  try {
    // Slugify the title first
    const baseHandle = slugify(title);

    // If we have an ignoreArticleId, check if this article already exists
    if (ignoreArticleId) {
      const [existingArticle] = await persistenceRepository.article.find({
        where: eq("id", ignoreArticleId),
        columns: ["id", "handle"],
        limit: 1,
      });

      // If the article exists and its handle is already the slugified title,
      // we can just return that handle (no need to append a number)
      if (existingArticle && existingArticle.handle === baseHandle) {
        return baseHandle;
      }
    }

    // Find all articles with the same base handle or handles that have numeric suffixes
    const handlePattern = `${baseHandle}-%`;
    let baseHandleWhereClause: any = eq<Article, keyof Article>(
      "handle",
      baseHandle
    );
    let suffixWhereClause: any = like<Article>("handle", handlePattern);

    let whereClause: any = or(baseHandleWhereClause, suffixWhereClause);

    if (ignoreArticleId) {
      whereClause = and(
        whereClause,
        neq<Article, keyof Article>("id", ignoreArticleId)
      );
    }

    // Get all existing handles that match our patterns
    const existingArticles = await persistenceRepository.article.find({
      where: whereClause,
      columns: ["handle"],
      limit: 1,
    });

    // If no existing handles found, return the base handle
    if (existingArticles.length === 0) {
      return baseHandle;
    }

    // Check if the exact base handle exists
    const exactBaseExists = existingArticles.some(
      (article) => article.handle === baseHandle
    );

    // If the exact base handle doesn't exist, we can use it
    if (!exactBaseExists) {
      return baseHandle;
    }

    // Find the highest numbered suffix
    let highestNumber = 1;
    const regex = new RegExp(`^${baseHandle}-(\\d+)$`);

    existingArticles.forEach((article) => {
      const match = article.handle.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= highestNumber) {
          highestNumber = num + 1;
        }
      }
    });

    // Return with the next number in sequence
    return `${baseHandle}-${highestNumber}`;
  } catch (error) {
    handleActionException(error);
    throw error;
  }
};

export async function updateMyArticle(
  _input: z.infer<typeof ArticleRepositoryInput.updateMyArticleInput>
) {
  try {
    const sessionUserId = await authID();
    if (!sessionUserId) {
      throw new ActionException("Unauthorized");
    }

    const input =
      await ArticleRepositoryInput.updateMyArticleInput.parseAsync(_input);

    const article = await persistenceRepository.article.update({
      where: and(eq("id", input.article_id), eq("author_id", sessionUserId)),
      data: removeNullOrUndefinedFromObject({
        title: input.title,
        handle: input.handle,
        excerpt: input.excerpt,
        body: input.body,
        cover_image: input.cover_image,
        metadata: input.metadata,
      }),
    });

    if (input.tag_ids) {
      await syncTagsWithArticles({
        article_id: input.article_id,
        tag_ids: input.tag_ids,
      });
    }

    return article?.rows?.[0];
  } catch (error) {
    handleActionException(error);
  }
}

export async function scheduleArticleDelete(article_id: string) {
  try {
    const session_userID = await authID();
    if (!session_userID) {
      throw new ActionException("Unauthorized");
    }

    const [permissibleArticle] = await persistenceRepository.article.find({
      where: and(eq("id", article_id), eq("author_id", session_userID)),
    });

    if (!permissibleArticle) {
      throw new ActionException("Unauthorized");
    }

    const updated = await persistenceRepository.article.update({
      where: and(eq("id", article_id), eq("author_id", session_userID)),
      data: {
        delete_scheduled_at: addDays(new Date(), 7),
      },
    });

    return {
      success: true as const,
      data: updated.rows[0],
    } satisfies ActionResponse<unknown>;
  } catch (error) {
    return handleActionException(error);
  }
}

export const restoreShceduleDeletedArticle = async (
  article_id: string
): Promise<ActionResponse<unknown>> => {
  try {
    const session_userID = await authID();
    if (!session_userID) {
      throw new ActionException("Unauthorized");
    }

    const [permissibleArticle] = await persistenceRepository.article.find({
      where: and(eq("id", article_id), eq("author_id", session_userID)),
    });

    if (!permissibleArticle) {
      throw new ActionException("Unauthorized");
    }

    const updated = await persistenceRepository.article.update({
      where: and(eq("id", article_id), eq("author_id", session_userID)),
      data: { delete_scheduled_at: null },
    });
    return {
      success: true as const,
      data: updated.rows[0],
    };
  } catch (error) {
    return handleActionException(error);
  }
};

/**
 * Deletes an article from the database.
 *
 * @param article_id - The unique identifier of the article to delete
 * @returns Promise<Article> - The deleted article
 * @throws {ActionException} If article deletion fails or article not found
 */
export async function deleteArticle(article_id: string) {
  try {
    const deletedArticles = await persistenceRepository.article.delete({
      where: eq("id", article_id),
    });

    return deletedArticles?.rows?.[0];
  } catch (error) {
    handleActionException(error);
  }
}

/**
 * Retrieves the most recent published articles.
 *
 * @param limit - Maximum number of articles to return (default: 5)
 * @returns Promise<Article[]> - Array of recent articles with author information
 * @throws {ActionException} If query fails
 */
// export async function findRecentArticles(
//   limit: number = 5
// ): Promise<Article[]> {
//   try {
//     return articleRepository.findRows({
//       where: and(eq("is_published", true), neq("published_at", null)),
//       limit,
//       orderBy: [desc("published_at")],
//       columns: ["id", "title", "handle"],
//       joins: [
//         leftJoin<Article, User>({
//           as: "user",
//           joinTo: "users",
//           localField: "author_id",
//           foreignField: "id",
//           columns: ["id", "name", "username", "profile_photo"],
//         }),
//       ],
//     });
//   } catch (error) {
//     handleRepositoryException(error);
//     return [];
//   }
// }

/**
 * Retrieves a paginated feed of published articles.
 *
 * @param _input - Feed parameters including page and limit, validated against ArticleRepositoryInput.feedInput schema
 * @returns Promise<{ data: Article[], total: number }> - Paginated articles with total count
 * @throws {ActionException} If query fails or validation fails
 */
export async function articleFeed(
  _input: z.infer<typeof ArticleRepositoryInput.feedInput>
) {
  try {
    const input = await ArticleRepositoryInput.feedInput.parseAsync(_input);

    const response = await persistenceRepository.article.paginate({
      where: and(eq("is_published", true), neq("approved_at", null)),
      page: input.page,
      limit: input.limit,
      orderBy: [desc("published_at")],
      columns: [
        "id",
        "title",
        "handle",
        "cover_image",
        "body",
        "created_at",
        "excerpt",
      ],
      joins: [
        {
          as: "user",
          table: DatabaseTableName.users,
          type: "left",
          on: {
            foreignField: "id",
            localField: "author_id",
          },
          columns: ["id", "name", "username", "profile_photo"],
        } as sk.Join<Article, User>,
      ],
    });

    response["nodes"] = response["nodes"].map((article) => {
      return {
        ...article,
        excerpt: article.excerpt ?? removeMarkdownSyntax(article.body),
      };
    });

    return response;
  } catch (error) {
    handleActionException(error);
  }
}

export async function userArticleFeed(
  _input: z.infer<typeof ArticleRepositoryInput.userFeedInput>,
  columns?: (keyof Article)[]
) {
  try {
    const input = await ArticleRepositoryInput.userFeedInput.parseAsync(_input);

    const response = await persistenceRepository.article.paginate({
      operationName: "userArticleFeed",
      where: and(
        eq("is_published", true),
        neq("approved_at", null),
        eq("author_id", input.user_id)
      ),
      page: input.page,
      limit: input.limit,
      orderBy: [desc("published_at")],
      columns,
      joins: [
        {
          as: "user",
          table: DatabaseTableName.users,
          type: "left",
          on: {
            foreignField: "id",
            localField: "author_id",
          },
          columns: ["id", "name", "username", "profile_photo"],
        } as sk.Join<Article, User>,
      ],
    });

    response["nodes"] = response["nodes"].map((article) => {
      return {
        ...article,
        excerpt: article.excerpt ?? removeMarkdownSyntax(article.body),
      };
    });

    return response;
  } catch (error) {
    handleActionException(error);
  }
}

export async function articleDetailByHandle(article_handle: string) {
  try {
    const [article] = await persistenceRepository.article.find({
      where: eq("handle", article_handle),
      columns: [
        "id",
        "title",
        "handle",
        "excerpt",
        "body",
        "cover_image",
        "is_published",
        "published_at",
        "approved_at",
        "metadata",
        "author_id",
        "created_at",
        "updated_at",
      ],
      joins: [
        {
          as: "user",
          type: "left",
          table: DatabaseTableName.users,
          on: {
            foreignField: "id",
            localField: "author_id",
          },
          columns: ["id", "name", "username", "profile_photo"],
        } as sk.Join<Article, User>,
      ],
      limit: 1,
    });

    if (!article) {
      throw new ActionException("Article not found");
    }

    return article;
  } catch (error) {
    handleActionException(error);
  }
}

export async function articleDetailByUUID(uuid: string) {
  try {
    const [article] = await persistenceRepository.article.find({
      where: eq("id", uuid),
      columns: [
        "id",
        "title",
        "handle",
        "excerpt",
        "body",
        "cover_image",
        "is_published",
        "published_at",
        "approved_at",
        "metadata",
        "author_id",
        "created_at",
        "updated_at",
      ],
      joins: [
        {
          as: "user",
          table: "users",
          on: {
            foreignField: "id",
            localField: "author_id",
          },
          type: "left",
          columns: ["id", "name", "username", "profile_photo"],
        },
      ],
      limit: 1,
    });

    if (!article) {
      throw new ActionException("Article not found");
    }

    return article;
  } catch (error) {
    handleActionException(error);
  }
}

export async function myArticles(
  input: z.infer<typeof ArticleRepositoryInput.myArticleInput>
) {
  const sessionUserId = await authID();

  if (!sessionUserId) {
    throw new ActionException("Unauthorized");
  }

  try {
    const articles = await persistenceRepository.article.paginate({
      where: eq("author_id", sessionUserId!),
      columns: [
        "id",
        "title",
        "handle",
        "created_at",
        "is_published",
        "delete_scheduled_at",
        "approved_at",
      ],
      limit: input.limit,
      page: input.page,
      orderBy: [desc("created_at")],
    });
    return articles;
  } catch (error) {
    handleActionException(error);
  }
}

/**
 * Updates the status of an article.
 * @param article_id - The unique identifier of the article to update
 * @param is_published - The new status of the article
 * @returns
 */
export async function setArticlePublished(
  article_id: string,
  is_published: boolean
) {
  const sessionUserId = await authID();
  try {
    const articles = await persistenceRepository.article.update({
      where: and(
        eq("id", article_id),
        eq("author_id", sessionUserId?.toString()!)
      ),
      data: {
        is_published: is_published,
        published_at: is_published ? new Date() : null,
      },
    });
    if (articles?.rows?.[0] && is_published) {
      syncArticleById(article_id);
    }
    if (articles?.rows?.[0] && !is_published) {
      deleteArticleById(article_id);
    }
    return articles?.rows?.[0];
  } catch (error) {
    handleActionException(error);
  }
}
