"use server";

import { and, eq, inArray, like } from "sqlkit";
import { pgClient } from "../persistence/clients";
import { z } from "zod/v4";
import { persistenceRepository } from "../persistence/persistence-repositories";
import { TagRepositoryInput } from "./inputs/tag.input";
import { ActionException, handleActionException } from "./RepositoryException";

const sql = String.raw;

export const getTopTags = async (limit = 8) => {
  try {
    const result = await pgClient.executeSQL(
      sql`
        SELECT t.id, t.name, t.icon, t.color, COUNT(atp.tag_id) AS article_count
        FROM tags t
        INNER JOIN article_tag atp ON atp.tag_id = t.id
        INNER JOIN articles a ON a.id = atp.article_id
        WHERE a.published_at IS NOT NULL AND a.approved_at IS NOT NULL
        GROUP BY t.id
        ORDER BY article_count DESC
        LIMIT $1
      `,
      [limit]
    );
    return { success: true as const, data: result?.rows ?? [] };
  } catch (error) {
    return handleActionException(error);
  }
};

export const getTags = async (
  _input: z.infer<typeof TagRepositoryInput.findAllInput>
) => {
  try {
    const input = await TagRepositoryInput.findAllInput.parseAsync(_input);
    const res = await persistenceRepository.tags.find({
      where: input.search
        ? like("name", `%${input.search.toLowerCase()}%`)
        : undefined,
    });
    return {
      data: res,
      success: true as const,
    };
  } catch (error) {
    return handleActionException(error);
  }
};

export const getTag = async (
  _input: z.infer<typeof TagRepositoryInput.getTag>
) => {
  try {
    const input = await TagRepositoryInput.getTag.parseAsync(_input);
    const response = await persistenceRepository.tags.find({
      where: eq("name", input.name),
    });

    if (!response[0]) {
      throw new ActionException("Tag not found");
    }

    return {
      data: response[0],
      success: true as const,
    };
  } catch (error) {
    return handleActionException(error);
  }
};

export const createTag = async (
  _input: z.infer<typeof TagRepositoryInput.createInput>
) => {
  try {
    const input = await TagRepositoryInput.createInput.parseAsync(_input);
    const response = await persistenceRepository.tags.insert([
      {
        name: input.name,
        description: input.description,
        color: input.color,
      },
    ]);

    return {
      success: true as const,
      data: response.rows[0],
    };
  } catch (error) {
    return handleActionException(error);
  }
};

export const syncTagsWithArticles = async (
  _input: z.infer<typeof TagRepositoryInput.syncTagsWithArticlesInput>
) => {
  try {
    const input =
      await TagRepositoryInput.syncTagsWithArticlesInput.parseAsync(_input);

    // Find all tags
    const attached = await persistenceRepository.articleTagPivot.find({
      where: eq("article_id", input.article_id),
    });
    const attachedTagIds = attached.map((tag) => tag.tag_id) ?? [];

    // article -> [1,2,3,4,5]
    // input_tags -> [1,2,6]

    // find all tags attached to article
    const tagsToRemove = attachedTagIds.filter(
      (tag) => !input.tag_ids.includes(tag)
    );
    const tagsToAdd = input.tag_ids.filter(
      (tag) => !attachedTagIds.includes(tag)
    );

    if (tagsToAdd.length) {
      await persistenceRepository.articleTagPivot.insert(
        tagsToAdd.map((tag) => ({
          article_id: input.article_id,
          tag_id: tag,
        }))
      );
    }

    await persistenceRepository.articleTagPivot.delete({
      where: and(
        eq("article_id", input.article_id),
        inArray("tag_id", tagsToRemove)
      ),
    });
  } catch (error) {
    return handleActionException(error);
  }
};
