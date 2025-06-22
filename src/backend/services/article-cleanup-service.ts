"use server";
import { and, lt, neq } from "sqlkit";
import { persistenceRepository } from "../persistence/persistence-repositories";
import { handleActionException } from "./RepositoryException";
import { deleteArticleById } from "./search.service";

/**
 * Delete articles that have passed their scheduled deletion time
 */
export async function deleteExpiredArticles() {
  try {
    const currentTime = new Date();

    const articlesToDelete = await persistenceRepository.article.find({
      where: and(
        neq("delete_scheduled_at", null),
        lt("delete_scheduled_at", currentTime)
      ),
    });

    for (const article of articlesToDelete) {
      deleteArticleById(article.id);
    }

    const deleteResult = await persistenceRepository.article.delete({
      where: and(
        neq("delete_scheduled_at", null),
        lt("delete_scheduled_at", currentTime)
      ),
    });

    console.log(
      `Successfully deleted ${deleteResult?.rowCount} expired articles`
    );

    return {
      deletedCount: deleteResult?.rowCount || 0,
    };
  } catch (error) {
    console.error("Error deleting expired articles:", error);
    throw handleActionException(error);
  }
}
