import { env } from "@/env";
import { liteClient } from "algoliasearch/lite";

export const ARTICLES_INDEX = "articles";

export const algoliaSearchClient = liteClient(
  env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
);
