import z from "zod/v4";

export const CommentActionInput = {
  getComments: z.object({
    resource_id: z.uuid(),
    resource_type: z.enum(["ARTICLE", "COMMENT"]),
  }),
  create: z.object({
    comment_id: z.uuid().optional().nullable(),
    resource_id: z.uuid(),
    resource_type: z.enum(["ARTICLE", "COMMENT"]),
    body: z.string().min(1).max(5000),
  }),
  update: z.object({
    id: z.uuid(),
    body: z.string().min(1).max(500),
  }),
  delete: z.object({
    id: z.uuid(),
  }),
};
