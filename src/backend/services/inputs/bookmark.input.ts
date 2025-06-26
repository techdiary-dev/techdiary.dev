import { z } from "zod";

export const BookmarkActionInput = {
  toggleBookmarkInput: z.object({
    resource_id: z.string(),
    resource_type: z.enum(["ARTICLE", "COMMENT"]),
  }),
  myBookmarks: z.object({
    limit: z.number().min(1).max(100).default(2),
    offset: z.number().min(0).default(0),
    page: z.number().min(1).default(1),
  }),
  bookmarkStatusInput: z.object({
    resource_id: z.string(),
    resource_type: z.enum(["ARTICLE", "COMMENT"]),
  }),
};
