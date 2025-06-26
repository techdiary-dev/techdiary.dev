import { env } from "@/env";
import { Meilisearch } from "meilisearch";

export const meilisearchClient = new Meilisearch({
  host: env.NEXT_PUBLIC_MEILISEARCH_API_HOST,
  apiKey: env.NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY,
});
