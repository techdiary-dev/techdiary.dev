import { serve } from "inngest/next";
import {
  inngest,
  persistNotificationFn,
  cleanupExpiredArticlesFn,
} from "@/lib/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [persistNotificationFn, cleanupExpiredArticlesFn],
});
