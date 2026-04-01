import { serve } from "inngest/next";
import { inngest, persistNotificationFn } from "@/lib/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [persistNotificationFn],
});
