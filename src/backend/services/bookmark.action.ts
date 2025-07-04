"use server";

import { and, eq } from "sqlkit";
import z from "zod/v4";
import { persistenceRepository } from "../persistence/persistence-repositories";
import { pgClient } from "../persistence/clients";
import { BookmarkActionInput } from "./inputs/bookmark.input";
import { ActionException, handleActionException } from "./RepositoryException";
import { authID } from "./session.actions";
import { BookmarkArticlePresentation } from "../models/domain-models";

const sql = String.raw;

export async function toggleResourceBookmark(
  _input: z.infer<typeof BookmarkActionInput.toggleBookmarkInput>
) {
  try {
    const sessionUserId = await authID();
    if (!sessionUserId) {
      throw new ActionException("Unauthorized");
    }
    const input =
      await BookmarkActionInput.toggleBookmarkInput.parseAsync(_input);

    // -----------
    const [existingBookmark] = await persistenceRepository.bookmark.find({
      limit: 1,
      where: and(
        eq("resource_id", input.resource_id),
        eq("resource_type", input.resource_type),
        eq("user_id", sessionUserId)
      ),
    });

    if (existingBookmark) {
      // If bookmark exists, delete it
      await persistenceRepository.bookmark.delete({
        where: and(
          eq("resource_id", input.resource_id),
          eq("resource_type", input.resource_type),
          eq("user_id", sessionUserId)
        ),
      });
      return { bookmarked: false };
    }

    // If bookmark does not exist, create it
    await persistenceRepository.bookmark.insert([
      {
        resource_id: input.resource_id,
        resource_type: input.resource_type,
        user_id: sessionUserId,
        created_at: new Date(),
      },
    ]);
    return { bookmarked: true };
  } catch (error) {
    handleActionException(error);
  }
}

export async function myBookmarks(
  _input: z.infer<typeof BookmarkActionInput.myBookmarks>
) {
  try {
    const sessionUserId = await authID();
    if (!sessionUserId) {
      throw new ActionException("Unauthorized");
    }

    const input = await BookmarkActionInput.myBookmarks.parseAsync(_input);
    const resourceType = "ARTICLE";
    const offset = input.page > 1 ? (input.page - 1) * input.limit : 0;

    const countQuery = sql`
      SELECT COUNT(*) AS totalCount
      FROM bookmarks
      WHERE user_id = $1 AND resource_type = $2
    `;

    const countResult: any = await pgClient?.executeSQL(countQuery, [
      sessionUserId,
      resourceType,
    ]);
    const totalCount = countResult?.rows[0]?.totalcount;
    const totalPages = Math.ceil(totalCount / input.limit);

    const bookmarksQuery = sql`
      SELECT 
        bookmarks.*,
        json_build_object(
          'id', articles.id, 
          'title', articles.title,
          'cover_image', articles.cover_image,
          'path', concat(users.username, '/', articles.handle),
          'author', json_build_object(
            'id', users.id,
            'name', users.name,
            'username', users.username,
            'email', users.email,
            'profile_photo', users.profile_photo
          )
        ) AS article
      FROM bookmarks
      LEFT JOIN articles ON articles.id = bookmarks.resource_id
      LEFT JOIN users ON users.id = articles.author_id
      WHERE bookmarks.user_id = $1 AND bookmarks.resource_type = $2
      ORDER BY bookmarks.created_at DESC
      LIMIT $3 OFFSET $4
    `;

    const bookmarks = await pgClient?.executeSQL(bookmarksQuery, [
      sessionUserId,
      resourceType,
      input.limit,
      offset,
    ]);

    return {
      nodes: bookmarks?.rows as BookmarkArticlePresentation[],
      meta: {
        totalCount: Number(totalCount),
        currentPage: input.page,
        hasNextPage: input.page < totalPages,
        totalPages,
      },
    };
  } catch (error) {
    handleActionException(error);
  }
}

// <BookmarkStatus resource_type="ARTICLE" resource_id="12345">
//   {data => {}}
// </BookmarkStatus>

export async function bookmarkStatus(
  _input: z.infer<typeof BookmarkActionInput.bookmarkStatusInput>
) {
  try {
    const sessionUserId = await authID();
    if (!sessionUserId) {
      throw new ActionException("Unauthorized");
    }
    const input =
      await BookmarkActionInput.bookmarkStatusInput.parseAsync(_input);

    // -----------
    const [existingBookmark] = await persistenceRepository.bookmark.find({
      limit: 1,
      where: and(
        eq("resource_id", input.resource_id),
        eq("resource_type", input.resource_type),
        eq("user_id", sessionUserId)
      ),
      columns: ["id"],
    });

    // If bookmark exists, return true
    return { bookmarked: Boolean(existingBookmark) };
  } catch (error) {
    handleActionException(error);
  }
}
