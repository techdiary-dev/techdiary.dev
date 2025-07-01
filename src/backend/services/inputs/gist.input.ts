import { z } from "zod";

export const CreateGistInput = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().optional(),
  is_public: z.boolean().default(true),
  files: z.array(z.object({
    filename: z.string().min(1, "Filename is required"),
    content: z.string().min(1, "File content is required"),
    language: z.string().optional(),
  })).min(1, "At least one file is required"),
});

export const UpdateGistInput = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long").optional(),
  description: z.string().optional(),
  is_public: z.boolean().optional(),
  files: z.array(z.object({
    id: z.string().optional(), // for existing files
    filename: z.string().min(1, "Filename is required"),
    content: z.string().min(1, "File content is required"),
    language: z.string().optional(),
    _action: z.enum(["create", "update", "delete"]).optional(),
  })).optional(),
});

export const GetGistInput = z.object({
  id: z.string().uuid("Invalid gist ID"),
});

export const ListGistsInput = z.object({
  user_id: z.string().uuid().optional(),
  is_public: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type CreateGistInputType = z.infer<typeof CreateGistInput>;
export type UpdateGistInputType = z.infer<typeof UpdateGistInput>;
export type GetGistInputType = z.infer<typeof GetGistInput>;
export type ListGistsInputType = z.infer<typeof ListGistsInput>;