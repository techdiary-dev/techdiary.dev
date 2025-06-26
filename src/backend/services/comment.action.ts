"use server";

import z from "zod";
import { CommentActionInput } from "./inputs/comment.input";
import { authID } from "./session.actions";
import { ActionException } from "./RepositoryException";
import { persistenceRepository } from "../persistence/persistence-repositories";
import { eq } from "sqlkit";
import { CommentPresentation } from "../models/domain-models";

const sql = String.raw;

export const getComments = async (
  _input: z.infer<typeof CommentActionInput.getComments>
): Promise<CommentPresentation[]> => {
  const input = CommentActionInput.getComments.parse(_input);

  const query = sql`
    SELECT get_comments($1, $2) as comments
  `;

  const execution_response: any = await pgClient?.executeSQL(query, [
    input.resource_id,
    input.resource_type,
  ]);
  return execution_response?.rows?.[0]?.comments || [];
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

export const deleteComment = async (
  input: z.infer<typeof CommentActionInput.delete>
) => {
  const { id } = input;

  // Delete the comment from the database
  // await db.delete(commentsTable).where(commentsTable.id.eq(id));

  // return { success: true };
};
