import { z } from "zod/v4";

export const ReactionActionInput = {
  toggleReactionInput: z.object({
    resource_id: z.string(),
    resource_type: z.enum(["ARTICLE", "COMMENT"]),
    reaction_type: z.enum(["LOVE", "UNICORN", "WOW", "FIRE", "CRY", "HAHA"]),
  }),
  getReactionsInput: z.object({
    resource_id: z.string(),
    resource_type: z.enum(["ARTICLE", "COMMENT"]),
  }),
};
