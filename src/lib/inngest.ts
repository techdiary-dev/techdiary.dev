import { Inngest } from "inngest";
import { z } from "zod/v4";
import { NotificationType, NotificationPayload } from "@/backend/models/domain-models";
import { persistenceRepository } from "@/backend/persistence/persistence-repositories";

export const notificationEventSchema = z.object({
  recipient_id: z.string(),
  actor_id: z.string().nullable().optional(),
  type: z.enum([
    "COMMENT_ON_ARTICLE",
    "REPLY_TO_COMMENT",
    "COMMENT_ON_GIST",
    "REACTION_ON_ARTICLE",
    "REACTION_ON_COMMENT",
  ]),
  payload: z
    .object({
      article_id: z.string().optional(),
      article_handle: z.string().optional(),
      article_title: z.string().optional(),
      article_author_username: z.string().optional(),
      comment_id: z.string().optional(),
      gist_id: z.string().optional(),
      reaction_type: z.string().optional(),
      actor_name: z.string().optional(),
      actor_username: z.string().optional(),
    })
    .optional(),
});

export type NotificationEventData = z.infer<typeof notificationEventSchema>;

export const inngest = new Inngest({
  id: "techdiary",
  eventKey: process.env.INNGEST_EVENT_KEY ?? "local",
});

export const persistNotificationFn = inngest.createFunction(
  {
    id: "persist-notification",
    triggers: [{ event: "app/notification.requested" }],
  },
  async ({ event }: { event: { data: NotificationEventData } }) => {
    const data = event.data;

    // Skip self-notifications
    if (data.recipient_id === data.actor_id) {
      return { skipped: true, reason: "self-notification" };
    }

    await persistenceRepository.notification.insert([
      {
        recipient_id: data.recipient_id,
        actor_id: data.actor_id ?? null,
        type: data.type as NotificationType,
        payload: (data.payload ?? null) as NotificationPayload | null,
        created_at: new Date(),
      },
    ]);

    return { success: true };
  }
);
