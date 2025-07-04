import { z } from "zod/v4";

export const SeriesInput = {
  seriesFeedInput: z.object({
    page: z.number().min(1).max(100),
    limit: z.number().min(1).max(100),
  }),
};
