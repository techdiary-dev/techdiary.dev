import { env } from "@/env";
import { Meilisearch } from "meilisearch";

export const meilisearchClient = new Meilisearch({
  host: env.NEXT_PUBLIC_MEILISEARCH_API_HOST,
  apiKey: env.MEILISEARCH_ADMIN_API_KEY,
});
