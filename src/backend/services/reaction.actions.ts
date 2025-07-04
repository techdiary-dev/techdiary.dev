"use server";

import z from "zod/v4";
import { BookmarkActionInput } from "./inputs/bookmark.input";
import { authID } from "./session.actions";
import { ActionException, handleActionException } from "./RepositoryException";
import { persistenceRepository } from "../persistence/persistence-repositories";
import { and, eq } from "sqlkit";
import { ReactionActionInput } from "./inputs/reaction.input";
import { ReactionStatus } from "../models/domain-models";

const sql = String.raw;

export async function toogleReaction(
  _input: z.infer<typeof ReactionActionInput.toggleReactionInput>
) {
  try {
    const sessionUserId = await authID();
    if (!sessionUserId) {
      throw new ActionException("Unauthorized");
    }
    const input =
      await ReactionActionInput.toggleReactionInput.parseAsync(_input);

    // -----------
    const [existingReaction] = await persistenceRepository.reaction.find({
      limit: 1,
      where: and(
        eq("resource_id", input.resource_id),
        eq("resource_type", input.resource_type),
        eq("reaction_type", input.reaction_type),
        eq("user_id", sessionUserId)
      ),
    });

    if (existingReaction) {
      // If reaction exists, delete it
      await persistenceRepository.reaction.delete({
        where: and(
          eq("resource_id", input.resource_id),
          eq("resource_type", input.resource_type),
          eq("reaction_type", input.reaction_type),
          eq("user_id", sessionUserId)
        ),
      });
      return {
        reaction_type: input.reaction_type,
        resource_id: input.resource_id,
        is_reacted: false,
      };
    }

    // If reaction does not exist, create it
    await persistenceRepository.reaction.insert([
      {
        resource_id: input.resource_id,
        resource_type: input.resource_type,
        reaction_type: input.reaction_type,
        user_id: sessionUserId,
        created_at: new Date(),
      },
    ]);
    return {
      reaction_type: input.reaction_type,
      resource_id: input.resource_id,
      is_reacted: true,
    };
  } catch (error) {
    handleActionException(error);
  }
}

export async function getResourceReactions(
  _input: z.infer<typeof ReactionActionInput.getReactionsInput>
) {
  try {
    const input =
      await ReactionActionInput.getReactionsInput.parseAsync(_input);
    const sessionUserId = await authID();

    const sql_query = sql`
      SELECT
          reaction_type,
          COUNT(DISTINCT user_id) AS count,
          ARRAY_AGG(DISTINCT user_id) AS reactor_user_ids
      FROM
          reactions
      WHERE
          resource_id = $1 AND
          resource_type = $2
      GROUP BY
          reaction_type;
    `;

    const response = await pgClient?.executeSQL(sql_query, [
      input.resource_id,
      input.resource_type,
    ]);

    const rows = response?.rows as ReactionStatus[];

    // Create a map of results
    const reactionMap = new Map<
      string,
      { count: number; is_reacted: boolean; reactor_user_ids: string[] }
    >();

    for (const row of rows) {
      const reaction_type = row?.reaction_type;
      const count = Number(row?.count ?? 0);
      const reactor_user_ids = row?.reactor_user_ids ?? [];
      const is_reacted = reactor_user_ids.includes(sessionUserId!);

      if (reaction_type) {
        reactionMap.set(reaction_type, { count, is_reacted, reactor_user_ids });
      }
    }

    // Return all types, filling missing ones with count: 0
    return ["LOVE", "UNICORN", "WOW", "FIRE", "CRY", "HAHA"].map(
      (reaction_type) => {
        const entry = reactionMap.get(reaction_type);
        return {
          reaction_type,
          count: entry?.count ?? 0,
          is_reacted: entry?.is_reacted ?? false,
          reactor_user_ids: entry?.reactor_user_ids ?? [],
        };
      }
    );
  } catch (error) {
    handleActionException(error);
  }
}
