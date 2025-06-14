import { z } from "zod";

export const UserActionInput = {
  syncSocialUserInput: z.object({
    service: z.enum(["github"]),
    service_uid: z.string(),
    name: z.string(),
    username: z.string(),
    email: z.string().email(),
    profile_photo: z.string().url(),
    bio: z.string().optional().nullable(),
  }),
  updateMyProfileInput: z.object({
    name: z.string().optional(),
    username: z.string().optional(),
    email: z.string().email().optional(),
    profile_photo: z.string().url().optional(),
    education: z.string().optional(),
    designation: z.string().optional(),
    bio: z.string().optional(),
    websiteUrl: z.string().url().optional(),
    location: z.string().optional(),
    social_links: z
      .object({
        github: z
          .string()
          .url()
          .regex(/^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+\/?$/, {
            message: "Invalid GitHub profile URL",
          })
          .optional(),
        x: z
          .string()
          .url()
          .regex(
            /^https:\/\/(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]+\/?$/,
            {
              message: "Invalid X (Twitter) profile URL",
            }
          )
          .optional(),
        linkedin: z
          .string()
          .url()
          .regex(/^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/, {
            message: "Invalid LinkedIn profile URL",
          })
          .optional(),
        facebook: z
          .string()
          .url()
          .regex(/^https:\/\/(www\.)?facebook\.com\/[A-Za-z0-9.]+\/?$/, {
            message: "Invalid Facebook profile URL",
          })
          .optional(),
        instagram: z
          .string()
          .url()
          .regex(/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/, {
            message: "Invalid Instagram profile URL",
          })
          .optional(),
        youtube: z
          .string()
          .url()
          .regex(
            /^https:\/\/(www\.)?youtube\.com\/(c|channel|user)\/[A-Za-z0-9_-]+\/?$/,
            {
              message: "Invalid YouTube profile URL",
            }
          )
          .optional(),
      })
      .optional(),
    profile_readme: z.string().optional(),
    skills: z.string().optional(),
  }),
};
