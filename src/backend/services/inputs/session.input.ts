import { z } from "zod/v4";

export const UserSessionInput = {
  createLoginSessionInput: z.object({
    user_id: z.string(),
    request: z.instanceof(Request),
  }),
  createBackdoorLoginSessionInput: z.object({
    user_id: z.string(),
    secret: z.string(),
  }),
};
