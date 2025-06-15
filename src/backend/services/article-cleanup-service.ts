"use server";

import { eq, and, lt, isNotNull, sql } from "drizzle-orm";
import { drizzleClient } from "../persistence/clients";
import { articlesTable } from "../persistence/schemas";
import { handleActionException } from "./RepositoryException";

export interface CleanupResult {
  deletedCount: number;
  deletedArticles: Array<{
    id: string;
    title: string;
    handle: string;
    delete_scheduled_at: Date;
  }>;
}

/**
 * Delete articles that have passed their scheduled deletion time
 */
export async function deleteExpiredArticles(): Promise<CleanupResult> {
  try {
    // First, get the articles that are scheduled for deletion and have passed their deletion time
    const currentTime = new Date();
    
    const expiredArticles = await drizzleClient
      .select({
        id: articlesTable.id,
        title: articlesTable.title,
        handle: articlesTable.handle,
        delete_scheduled_at: articlesTable.delete_scheduled_at,
      })
      .from(articlesTable)
      .where(
        and(
          isNotNull(articlesTable.delete_scheduled_at),
          lt(articlesTable.delete_scheduled_at, currentTime)
        )
      );

    console.log(`Found ${expiredArticles.length} articles scheduled for deletion`);

    if (expiredArticles.length === 0) {
      return {
        deletedCount: 0,
        deletedArticles: [],
      };
    }

    // Delete the expired articles
    const articleIds = expiredArticles.map(article => article.id);
    
    const deleteResult = await drizzleClient
      .delete(articlesTable)
      .where(
        and(
          isNotNull(articlesTable.delete_scheduled_at),
          lt(articlesTable.delete_scheduled_at, currentTime)
        )
      );

    console.log(`Successfully deleted ${expiredArticles.length} expired articles`);

    return {
      deletedCount: expiredArticles.length,
      deletedArticles: expiredArticles.map(article => ({
        id: article.id,
        title: article.title || "Untitled",
        handle: article.handle || "",
        delete_scheduled_at: article.delete_scheduled_at!,
      })),
    };
  } catch (error) {
    console.error("Error deleting expired articles:", error);
    throw handleActionException(error);
  }
}

/**
 * Schedule an article for deletion at a specific time
 */
export async function scheduleArticleForDeletion(
  articleId: string,
  deleteAt: Date
): Promise<void> {
  try {
    await drizzleClient
      .update(articlesTable)
      .set({
        delete_scheduled_at: deleteAt,
        updated_at: new Date(),
      })
      .where(eq(articlesTable.id, articleId));

    console.log(`Article ${articleId} scheduled for deletion at ${deleteAt.toISOString()}`);
  } catch (error) {
    console.error("Error scheduling article for deletion:", error);
    throw handleActionException(error);
  }
}

/**
 * Cancel scheduled deletion for an article
 */
export async function cancelScheduledDeletion(articleId: string): Promise<void> {
  try {
    await drizzleClient
      .update(articlesTable)
      .set({
        delete_scheduled_at: null,
        updated_at: new Date(),
      })
      .where(eq(articlesTable.id, articleId));

    console.log(`Cancelled scheduled deletion for article ${articleId}`);
  } catch (error) {
    console.error("Error cancelling scheduled deletion:", error);
    throw handleActionException(error);
  }
}

/**
 * Get all articles scheduled for deletion
 */
export async function getScheduledArticles() {
  try {
    return await drizzleClient
      .select({
        id: articlesTable.id,
        title: articlesTable.title,
        handle: articlesTable.handle,
        delete_scheduled_at: articlesTable.delete_scheduled_at,
        author_id: articlesTable.author_id,
      })
      .from(articlesTable)
      .where(isNotNull(articlesTable.delete_scheduled_at))
      .orderBy(articlesTable.delete_scheduled_at);
  } catch (error) {
    console.error("Error getting scheduled articles:", error);
    throw handleActionException(error);
  }
}