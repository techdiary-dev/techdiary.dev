"use server";

import { env } from "@/env";
import { handleActionException } from "./RepositoryException";
import { IUnsplashImage } from "../models/domain-models";

export const searchUnsplash = async (query: string, page: number = 1) => {
  try {
    const params = new URLSearchParams({
      client_id: env.UNSPLASH_API_KEY,
      query: query,
      per_page: "20",
      page: page.toString(),
    });

    const response = await fetch(
      `https://api.unsplash.com/search/photos?${params.toString()}`,
    );
    const data = (await response.json()) as {
      results: IUnsplashImage[];
      total: number;
      total_pages: number;
    };

    return {
      success: true as const,
      data: {
        ...data,
        meta: {
          currentPage: page,
          hasNextPage: page < data.total_pages,
          totalPages: data.total_pages,
        },
      },
    };
  } catch (error) {
    return handleActionException(error);
  }
};
