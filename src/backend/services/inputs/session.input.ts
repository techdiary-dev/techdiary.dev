import { z } from "zod";

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
