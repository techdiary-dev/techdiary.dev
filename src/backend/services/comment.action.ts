"use server";

import z from "zod/v4";
import { CommentActionInput } from "./inputs/comment.input";
import { authID } from "./session.actions";
import {
  ActionException,
  handleActionException,
} from "./RepositoryException";
import { persistenceRepository } from "../persistence/persistence-repositories";
import { pgClient } from "../persistence/clients";
import { and, eq, inArray } from "sqlkit";
import { CommentPresentation } from "../models/domain-models";

const sql = String.raw;

export const getComments = async (
  _input: z.infer<typeof CommentActionInput.getComments>
): Promise<CommentPresentation[]> => {
  const input = CommentActionInput.getComments.parse(_input);

  const query = sql`
    SELECT get_comments($1, $2) as comments
  `;

  const execution_response: unknown = await pgClient.executeSQL(query, [
    input.resource_id,
    input.resource_type,
  ]);
  const rows = execution_response as { rows?: { comments?: CommentPresentation[] }[] };
  return rows?.rows?.[0]?.comments || [];
};

export const createMyComment = async (
  input: z.infer<typeof CommentActionInput.create>
) => {
  const sessionId = await authID();
  if (!sessionId) {
    throw new ActionException("Unauthorized: No session ID found");
  }
  const { resource_id, resource_type, body } = input;

  switch (resource_type) {
    case "ARTICLE":
      // Validate that the resource exists
      const [exists] = await persistenceRepository.article.find({
        where: eq("id", resource_id),
        limit: 1,
        columns: ["id"],
      });
      if (!exists) {
        throw new ActionException("Resource not found");
      }
      break;
    case "COMMENT":
      // Validate that the parent comment exists
      const [parentExists] = await persistenceRepository.comment.find({
        where: eq("id", resource_id),
        limit: 1,
        columns: ["id"],
      });
      if (!parentExists) {
        throw new ActionException("Parent comment not found");
      }
      break;
    case "GIST": {
      const [gistExists] = await persistenceRepository.gist.find({
        where: eq("id", resource_id),
        limit: 1,
        columns: ["id"],
      });
      if (!gistExists) {
        throw new ActionException("Resource not found");
      }
      break;
    }
    default:
      throw new ActionException("Invalid resource type");
  }

  const created = await persistenceRepository.comment.insert([
    {
      id: input.comment_id ?? crypto.randomUUID(),
      body,
      resource_id,
      resource_type,
      user_id: sessionId,
    },
  ]);

  return created?.rows?.[0];
};

export const updateMyComment = async (
  _input: z.infer<typeof CommentActionInput.update>
) => {
  try {
    const input = await CommentActionInput.update.parseAsync(_input);
    const userId = await authID();
    if (!userId) {
      throw new ActionException("Unauthorized");
    }

    const [existing] = await persistenceRepository.comment.find({
      where: eq("id", input.id),
      limit: 1,
    });
    if (!existing) {
      throw new ActionException("Comment not found");
    }
    if (existing.user_id !== userId) {
      throw new ActionException("Unauthorized");
    }

    await persistenceRepository.comment.update({
      where: and(eq("id", input.id), eq("user_id", userId)),
      data: { body: input.body, updated_at: new Date() },
    });

    return { success: true as const, data: { id: input.id } };
  } catch (error) {
    return handleActionException(error);
  }
};

/** Deletes the comment and all nested replies; reactions on those comments are removed first. */
export const deleteMyComment = async (
  _input: z.infer<typeof CommentActionInput.delete>
) => {
  try {
    const input = await CommentActionInput.delete.parseAsync(_input);
    const userId = await authID();
    if (!userId) {
      throw new ActionException("Unauthorized");
    }

    const [root] = await persistenceRepository.comment.find({
      where: eq("id", input.id),
      limit: 1,
    });
    if (!root) {
      throw new ActionException("Comment not found");
    }
    if (root.user_id !== userId) {
      throw new ActionException("Unauthorized");
    }

    const idsQuery = sql`
      WITH RECURSIVE subtree AS (
        SELECT id FROM comments WHERE id = $1::uuid
        UNION ALL
        SELECT c.id FROM comments c
        INNER JOIN subtree s ON c.resource_id = s.id AND c.resource_type = 'COMMENT'
      )
      SELECT id FROM subtree
    `;
    const idResult = await pgClient.executeSQL(idsQuery, [input.id]);
    const rows = idResult?.rows as { id: string }[] | undefined;
    const ids = (rows ?? []).map((r) => r.id);
    if (ids.length === 0) {
      throw new ActionException("Comment not found");
    }

    await persistenceRepository.reaction.delete({
      where: and(
        eq("resource_type", "COMMENT"),
        inArray("resource_id", ids)
      ),
    });

    await persistenceRepository.comment.delete({
      where: inArray("id", ids),
    });

    return { success: true as const, data: { id: input.id } };
  } catch (error) {
    return handleActionException(error);
  }
};
