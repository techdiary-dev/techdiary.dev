"use server";

import { env } from "@/env";
import { handleActionException } from "./RepositoryException";
import { IUnsplashImage } from "../models/domain-models";

export const searchUnsplash = async (query: string) => {
  try {
    const params = new URLSearchParams({
      client_id: env.UNSPLASH_API_KEY,
      query: query,
      per_page: "100",
    });

    const response = await fetch(
      `https://api.unsplash.com/search/photos?${params.toString()}`
    );
    return {
      success: true as const,
      data: (await response.json()) as {
        results: IUnsplashImage[];
        total: number;
        total_pages: number;
      },
    };
  } catch (error) {
    return handleActionException(error);
  }
};
