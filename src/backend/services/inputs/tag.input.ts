import { z } from "zod";

export const TagRepositoryInput = {
  findAllInput: z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional().nullable(),
  }),
  createInput: z.object({
    name: z.string(),
    icon: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
  }),
  updateInput: z.object({
    tag_id: z.string(),
    name: z.string().optional(),
    icon: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
  }),
  deleteInput: z.object({
    tag_id: z.string(),
  }),
};
