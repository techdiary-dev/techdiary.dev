"use server";

import { asc, eq } from "sqlkit";
import { z } from "zod/v4";
import { persistenceRepository } from "../persistence/persistence-repositories";
import { SeriesInput } from "./inputs/series.input";
import { handleActionException } from "./RepositoryException";

export async function seriesFeed(
  _input: z.infer<typeof SeriesInput.seriesFeedInput>
) {
  try {
    const input = await SeriesInput.seriesFeedInput.parseAsync(_input);

    return persistenceRepository.series.paginate({
      limit: input.limit,
      page: input.page,
    });
  } catch (error) {
    handleActionException(error);
  }
}

export const getSeriesDetailByHandle = async (handle: string) => {
  try {
    const [series] = await persistenceRepository.series.find({
      where: eq("handle", handle),
      limit: 1,
      joins: [
        // leftJoin<Series, User>({
        //   as: "owner",
        //   joinTo: "users",
        //   localField: "owner_id",
        //   foreignField: "id",
        //   columns: ["id", "name", "username", "profile_photo"],
        // }),
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

    const serieItems = await persistenceRepository.seriesItems.find({
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
      series,
      serieItems,
    };
  } catch (error) {
    handleActionException(error);
  }
};
