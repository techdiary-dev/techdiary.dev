"use server";

import { pgClient } from "@/backend/persistence/clients";
import { removeUndefinedFromObject } from "@/lib/utils";
import { eq } from "sqlkit";
import { ActionResponse } from "../models/action-contracts";
import { Gist } from "../models/domain-models";
import { persistenceRepository } from "../persistence/persistence-repositories";
import {
  CreateGistInput,
  CreateGistInputType,
  GetGistInput,
  GetGistInputType,
  ListGistsInput,
  ListGistsInputType,
  UpdateGistInput,
  UpdateGistInputType,
} from "./inputs/gist.input";
import { ActionException, handleActionException } from "./RepositoryException";
import { authID } from "./session.actions";

const sql = String.raw;

export async function createGist(
  _input: CreateGistInputType
): Promise<ActionResponse<Gist>> {
  try {
    const sessionUserId = await authID();
    if (!sessionUserId) {
      throw new ActionException("Unauthorized");
    }

    const input = await CreateGistInput.parseAsync(_input);

    // Create gist
    const gistInsertResponse = await persistenceRepository.gist.insert([
      {
        title: input.title,
        description: input.description,
        is_public: input.is_public,
        owner_id: sessionUserId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Create gist files
    const gistFiles = await persistenceRepository.gistFile.insert(
      input.files.map((file) => ({
        gist_id: gistInsertResponse.rows[0].id,
        filename: file.filename,
        content: file.content,
        language: file.language,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );

    const result: Gist = {
      ...gistInsertResponse.rows[0],
      files: gistFiles.rows,
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleActionException(error);
  }
}

export async function getGist(
  _input: GetGistInputType
): Promise<ActionResponse<Gist | null>> {
  try {
    const input = await GetGistInput.parseAsync(_input);
    const sessionUserId = await authID();

    let gist: Gist | null = null;

    const gistFindResponse = await persistenceRepository.gist.find({
      limit: 1,
      where: eq("id", input.id),
      joins: [
        {
          table: "users",
          as: "owner",
          type: "left",
          on: {
            localField: "owner_id",
            foreignField: "id",
          },
        },
      ],
    });

    // check visibility
    if (!gistFindResponse[0].is_public) {
      if (gistFindResponse[0].owner_id !== sessionUserId) {
        throw new ActionException("Not authorized to view this gist");
      }
    }

    if (gistFindResponse[0]) {
      gist = gistFindResponse[0];
    }

    if (!gist) {
      throw new ActionException("Gist not found");
    }

    const gistFiles = await persistenceRepository.gistFile.find({
      where: eq("gist_id", gist.id),
    });

    gist.files = gistFiles ?? [];

    return { success: true, data: gist };
  } catch (error) {
    return handleActionException(error);
  }
}

export async function updateGist(
  gistId: string,
  _input: UpdateGistInputType
): Promise<ActionResponse<Gist>> {
  try {
    const sessionUserId = await authID();
    if (!sessionUserId) {
      throw new ActionException("Unauthorized");
    }

    const input = await UpdateGistInput.parseAsync(_input);

    // Check ownership
    const [existingGist] = await persistenceRepository.gist.find({
      where: eq("id", gistId),
      limit: 1,
    });

    if (!existingGist) {
      throw new ActionException("Gist not found");
    }

    if (existingGist.owner_id !== sessionUserId) {
      throw new ActionException("Not authorized to update this gist");
    }

    // Update gist metadata
    const updateData = removeUndefinedFromObject({
      title: input.title,
      description: input.description,
      is_public: input.is_public,
      updated_at: new Date(),
    });

    if (Object.keys(updateData).length > 0) {
      await persistenceRepository.gist.update({
        where: eq("id", gistId),
        data: updateData,
      });
    }

    // Handle file updates if provided
    if (input.files) {
      for (const file of input.files) {
        if (file._action === "delete" && file.id) {
          await persistenceRepository.gistFile.delete({
            where: eq("id", file.id),
          });
        } else if (file._action === "update" && file.id) {
          await persistenceRepository.gistFile.update({
            where: eq("id", file.id),
            data: {
              filename: file.filename,
              content: file.content,
              language: file.language,
              updated_at: new Date(),
            },
          });
        } else if (!file.id || file._action === "create") {
          await persistenceRepository.gistFile.insert([
            {
              gist_id: gistId,
              filename: file.filename,
              content: file.content,
              language: file.language,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ]);
        }
      }
    }

    // Fetch updated gist with files
    const result = await getGist({ id: gistId });
    if (!result.success || !result.data) {
      throw new ActionException("Failed to fetch updated gist");
    }

    return { success: true, data: result.data };
  } catch (error) {
    return handleActionException(error);
  }
}

export async function deleteGist(
  gistId: string
): Promise<ActionResponse<void>> {
  try {
    const sessionUserId = await authID();
    if (!sessionUserId) {
      throw new ActionException("Unauthorized");
    }

    // Check ownership
    const [existingGist] = await persistenceRepository.gist.find({
      where: eq("id", gistId),
      limit: 1,
    });

    if (!existingGist) {
      throw new ActionException("Gist not found");
    }

    if (existingGist.owner_id !== sessionUserId) {
      throw new ActionException("Not authorized to delete this gist");
    }

    // Delete gist (files will be deleted due to cascade)
    await persistenceRepository.gist.delete({
      where: eq("id", gistId),
    });

    return { success: true, data: undefined };
  } catch (error) {
    return handleActionException(error);
  }
}

export async function listGists(
  _input: ListGistsInputType = {
    limit: 100,
    offset: 0,
  }
): Promise<ActionResponse<Gist[]>> {
  try {
    const input = await ListGistsInput.parseAsync(_input);
    const sessionUserId = await authID();

    // Build WHERE conditions
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (input.user_id) {
      whereConditions.push(`g.owner_id = $${paramIndex}`);
      queryParams.push(input.user_id);
      paramIndex++;
    }

    if (input.is_public !== undefined) {
      whereConditions.push(`g.is_public = $${paramIndex}`);
      queryParams.push(input.is_public);
      paramIndex++;
    } else if (!sessionUserId) {
      // Show only public gists to unauthenticated users
      whereConditions.push("g.is_public = true");
    } else if (!input.user_id) {
      // Show public gists + user's own gists when not filtering by user
      whereConditions.push(
        `(g.is_public = true OR g.owner_id = $${paramIndex})`
      );
      queryParams.push(sessionUserId);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    queryParams.push(input.limit, input.offset);

    const query = sql`
      SELECT 
        g.*,
        u.name as owner_name,
        u.username as owner_username,
        u.profile_photo as owner_profile_photo
      FROM gists g
      LEFT JOIN users u ON g.owner_id = u.id
      ${whereClause}
      ORDER BY g.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await pgClient.executeSQL<Gist>(query, queryParams);
    const rows = result.rows;

    const gists: Gist[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      is_public: row.is_public,
      owner_id: row.owner_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      owner: row.owner_name
        ? ({
            id: row.owner_id,
            name: row.owner_name,
            username: row.owner_username,
            profile_photo: row.owner_profile_photo,
          } as any)
        : null,
    }));

    return { success: true, data: gists };
  } catch (error) {
    return handleActionException(error);
  }
}

export async function getMyGists(): Promise<ActionResponse<Gist[]>> {
  try {
    const sessionUserId = await authID();
    if (!sessionUserId) {
      throw new ActionException("Unauthorized");
    }

    return await listGists({ user_id: sessionUserId, limit: 100, offset: 0 });
  } catch (error) {
    return handleActionException(error);
  }
}
