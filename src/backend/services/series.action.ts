"use server";

import { and, asc, eq, inArray, neq, PaginatedResult } from "sqlkit";
import { z } from "zod";
import { ActionResponse } from "../models/action-contracts";
import { persistenceRepository } from "../persistence/persistence-repositories";
import { SeriesInput } from "./inputs/series.input";
import { handleActionException } from "./RepositoryException";
import { authID } from "./session.actions";
import { Series } from "../models/domain-models";

export async function seriesFeed(
  _input: z.infer<typeof SeriesInput.seriesFeedInput>
): Promise<ActionResponse<PaginatedResult<Series>>> {
  try {
    const input = await SeriesInput.seriesFeedInput.parseAsync(_input);

    const result = await persistenceRepository.series.paginate({
      limit: input.limit,
      page: input.page,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleActionException(error);
  }
}

export const getSeriesDetailByHandle = async (
  handle?: string
): Promise<ActionResponse<any>> => {
  try {
    if (!handle) {
      // Return paginated series list for current user
      const userId = await authID();
      if (!userId) {
        throw new Error("Unauthorized");
      }

      const result = await persistenceRepository.series.paginate({
        where: eq("owner_id", userId),
        limit: 10,
        page: 1,
        orderBy: [asc("created_at")],
      });

      return {
        success: true,
        data: result,
      };
    }

    const [series] = await persistenceRepository.series.find({
      where: eq("handle", handle),
      limit: 1,
      joins: [
        {
          on: {
            foreignField: "id",
            localField: "owner_id",
          },
          as: "owner",
          columns: ["id", "name", "username", "profile_photo"],
          table: "users",
          type: "left",
        },
      ],
    });

    const seriesItems = await persistenceRepository.seriesItems.find({
      where: eq("series_id", series.id),
      orderBy: [asc("index")],
      limit: -1,
      joins: [
        {
          as: "article",
          table: "articles",
          type: "left",
          on: {
            localField: "article_id",
            foreignField: "id",
          },
          columns: ["id", "title", "handle"],
        },
      ],
    });

    return {
      success: true,
      data: {
        series,
        seriesItems,
      },
    };
  } catch (error) {
    return handleActionException(error);
  }
};

export const getSeriesById = async (
  id: string
): Promise<ActionResponse<any>> => {
  try {
    const userId = await authID();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const [series] = await persistenceRepository.series.find({
      where: and(eq("id", id), eq("owner_id", userId)),
      limit: 1,
    });

    if (!series) {
      throw new Error("Series not found");
    }

    const items = await persistenceRepository.seriesItems.find({
      where: eq("series_id", id),
      orderBy: [asc("index")],
      limit: -1,
      joins: [
        {
          as: "article",
          table: "articles",
          type: "left",
          on: {
            localField: "article_id",
            foreignField: "id",
          },
          columns: ["id", "title", "handle"],
        },
      ],
    });

    return {
      success: true,
      data: {
        ...series,
        items,
      },
    };
  } catch (error) {
    return handleActionException(error);
  }
};

export const createSeries = async (
  formData: FormData
): Promise<ActionResponse<Series>> => {
  try {
    const userId = await authID();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const itemsData = formData.get("items") as string;

    console.log("Debug createSeries - received data:", {
      title,
      itemsData,
    });

    if (!title) {
      throw new Error("Title is required");
    }

    // Generate handle from title
    const handle = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Create series
    const seriesResult = await persistenceRepository.series.insert([
      {
        title,
        handle,
        owner_id: userId,
      },
    ]);

    const series = seriesResult?.rows?.[0];
    if (!series) {
      throw new Error("Failed to create series");
    }

    console.log("Debug createSeries - series created:", series);

    // Create series items if provided
    if (itemsData) {
      const items = JSON.parse(itemsData) as Array<{
        type: string;
        title: string;
        article_id: string;
        index: number;
      }>;

      console.log("Debug createSeries - parsed items:", items);

      // Check if any articles are already in other series
      const articleIds = items
        .filter((item: any) => item.article_id)
        .map((item: any) => item.article_id);

      if (articleIds.length > 0) {
        const existingItems = await persistenceRepository.seriesItems.find({
          where: and(eq("type", "ARTICLE"), inArray("article_id", articleIds)),
          limit: -1,
          columns: ["article_id"],
        });

        if (existingItems.length > 0) {
          throw new Error(
            "One or more articles are already part of another series"
          );
        }
      }

      for (const item of items) {
        const insertData = {
          series_id: series.id,
          type: "ARTICLE" as const,
          title: item.title,
          article_id: item.article_id,
          index: item.index,
        };

        console.log("Debug createSeries - inserting series item:", insertData);

        const insertResult = await persistenceRepository.seriesItems.insert([
          insertData,
        ]);

        console.log("Debug createSeries - insert result:", insertResult);
      }
    }

    return {
      success: true as const,
      data: series,
    };
  } catch (error) {
    return handleActionException(error);
  }
};

export const updateSeries = async (
  id: string,
  formData: FormData
): Promise<ActionResponse<any>> => {
  try {
    const userId = await authID();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const itemsData = formData.get("items") as string;

    if (!title) {
      throw new Error("Title is required");
    }

    // Update series (only if user owns it)
    await persistenceRepository.series.update({
      where: and(eq("id", id), eq("owner_id", userId)),
      data: {
        title,
        handle: title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      },
    });

    // Delete existing items and recreate
    await persistenceRepository.seriesItems.delete({
      where: eq("series_id", id),
    });

    // Create new items if provided
    if (itemsData) {
      const items = JSON.parse(itemsData) as Array<{
        type: string;
        title: string;
        article_id: string;
        index: number;
      }>;

      // Check if any articles are already in other series (excluding current series)
      const articleIds = items
        .filter((item: any) => item.article_id)
        .map((item: any) => item.article_id);

      if (articleIds.length > 0) {
        const existingItems = await persistenceRepository.seriesItems.find({
          where: and(
            eq("type", "ARTICLE"),
            neq("series_id", id),
            inArray("article_id", articleIds)
          ),
          limit: -1,
          columns: ["article_id"],
        });

        if (existingItems.length > 0) {
          throw new Error(
            "One or more articles are already part of another series"
          );
        }
      }

      for (const item of items) {
        await persistenceRepository.seriesItems.insert([
          {
            series_id: id,
            type: "ARTICLE" as const,
            title: item.title,
            article_id: item.article_id,
            index: item.index,
          },
        ]);
      }
    }

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    return handleActionException(error);
  }
};

export const deleteSeries = async (
  id: string
): Promise<ActionResponse<null>> => {
  try {
    const userId = await authID();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify ownership before deletion
    const [series] = await persistenceRepository.series.find({
      where: and(eq("id", id), eq("owner_id", userId)),
      limit: 1,
    });

    if (!series) {
      throw new Error("Series not found or unauthorized");
    }

    // Delete series items first (foreign key constraint)
    await persistenceRepository.seriesItems.delete({
      where: eq("series_id", id),
    });

    // Delete series
    await persistenceRepository.series.delete({
      where: eq("id", id),
    });

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    return handleActionException(error);
  }
};

export const getUserArticles = async (
  excludeSeriesId?: string
): Promise<ActionResponse<any[]>> => {
  try {
    const userId = await authID();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // First, let's see ALL series items in the database
    const allSeriesItems = await persistenceRepository.seriesItems.find({
      where: eq("type", "ARTICLE"),
      limit: -1,
    });

    console.log("Debug - ALL series items in database:", allSeriesItems);

    // Get all article IDs that are already in series (excluding the current series being edited)
    let existingSeriesItems;
    if (excludeSeriesId) {
      existingSeriesItems = await persistenceRepository.seriesItems.find({
        where: and(eq("type", "ARTICLE"), neq("series_id", excludeSeriesId)),
        limit: -1,
        columns: ["article_id"],
      });
      console.log("Debug - Query for EDIT mode (excluding current series)");
    } else {
      existingSeriesItems = await persistenceRepository.seriesItems.find({
        where: eq("type", "ARTICLE"),
        limit: -1,
        columns: ["article_id"],
      });
      console.log("Debug - Query for NEW mode (excluding all series)");
    }

    console.log("Debug - Filtered series items:", existingSeriesItems);

    const usedArticleIds = existingSeriesItems
      .map((item) => item.article_id)
      .filter(Boolean); // Remove any null/undefined values

    console.log("Debug getUserArticles:", {
      excludeSeriesId,
      existingSeriesItemsCount: existingSeriesItems.length,
      usedArticleIds: usedArticleIds,
    });

    // Get all user's articles first
    const allUserArticles = await persistenceRepository.article.find({
      where: eq("author_id", userId),
      orderBy: [asc("created_at")],
      limit: -1,
      columns: ["id", "title", "handle"],
    });

    // Filter out articles that are already in series (client-side filtering)
    const availableArticles = allUserArticles.filter(
      (article) => !usedArticleIds.includes(article.id)
    );

    console.log("Debug getUserArticles result:", {
      totalUserArticles: allUserArticles.length,
      availableArticles: availableArticles.length,
      availableArticleIds: availableArticles.map((a) => a.id),
    });

    return {
      success: true,
      data: availableArticles,
    };
  } catch (error) {
    return handleActionException(error);
  }
};
