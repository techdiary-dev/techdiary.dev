import { env } from "@/env";
import { algoliasearch } from "algoliasearch";
import { ARTICLES_INDEX } from "./algolia.client";

export { ARTICLES_INDEX };

export const algoliaAdminClient = algoliasearch(
  env.ALGOLIA_APP_ID,
  env.ALGOLIA_ADMIN_API_KEY,
);
