import { z } from "zod/v4";

export const NotificationActionInput = {
  list: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(50).default(20),
  }),
  markRead: z.object({
    id: z.string().uuid(),
  }),
};
