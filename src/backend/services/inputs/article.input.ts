import { z } from "zod";

export const ArticleRepositoryInput = {
  createArticleInput: z.object({
    title: z.string(),
    handle: z.string(),
    excerpt: z.string().optional().nullable(),
    body: z.string().optional().nullable(),
    cover_image: z
      .object({
        key: z.string(),
        provider: z.enum(["cloudinary", "direct", "r2"]),
      })
      .optional()
      .nullable(),
    is_published: z.boolean().optional().nullable(),
    author_id: z.string(),
  }),

  createMyArticleInput: z.object({
    title: z.string(),
    excerpt: z.string().optional().nullable(),
    body: z.string().optional().nullable(),
    cover_image: z
      .object({
        key: z.string(),
        provider: z.enum(["cloudinary", "direct"]),
      })
      .optional()
      .nullable(),
    is_published: z.boolean().optional().nullable(),
  }),

  updateArticleInput: z.object({
    article_id: z.string(),
    title: z.string().optional(),
    handle: z.string().optional(),
    excerpt: z.string().optional(),
    body: z.string().optional(),
    cover_image: z
      .object({
        key: z.string(),
        provider: z.enum(["cloudinary", "direct", "r2"]),
      })
      .optional()
      .nullable(),
    is_published: z.boolean().optional(),
  }),
  updateMyArticleInput: z.object({
    article_id: z.string(), // Required, unique identifier for the article

    // Optional fields for updating
    title: z.string().optional(),
    handle: z.string().optional(),
    excerpt: z.string().optional(),
    body: z.string().optional(),

    // Optional nested object for cover image
    cover_image: z
      .object({
        key: z.string(),
        provider: z.enum(["cloudinary", "direct", "r2"]),
        alt: z.string().optional(),
      })
      .optional()
      .nullable(),

    // Optional boolean flag for publication status
    is_published: z.boolean().optional(),

    tag_ids: z.array(z.string()).optional().nullable(),

    // Optional metadata object
    metadata: z
      .object({
        seo: z
          .object({
            title: z.string().optional(),
            description: z.string().optional(),
            keywords: z.array(z.string()).optional(),
            canonical_url: z
              .union([z.string().url(), z.literal(""), z.null()])
              .optional()
              .nullable()
              .transform((val) => (val === "" ? null : val)),
          })
          .nullable()
          .optional(),
      })
      .nullable()
      .optional(),
  }),

  feedInput: z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
  }),

  userFeedInput: z.object({
    user_id: z.string(),
    page: z.number().default(1),
    limit: z.number().default(10),
  }),

  findArticlesByAuthorInput: z.object({
    author_id: z.string(),
    published_only: z.boolean().default(false),
    page: z.number().default(1),
    limit: z.number().default(10),
  }),

  searchArticlesInput: z.object({
    search_term: z.string().optional(),
    published_only: z.boolean().default(true),
    page: z.number().default(1),
    limit: z.number().default(10),
  }),

  myArticleInput: z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
  }),

  tagFeedInput: z.object({
    tag_id: z.string().uuid(),
    page: z.number().default(1),
    limit: z.number().default(10),
  }),
};
