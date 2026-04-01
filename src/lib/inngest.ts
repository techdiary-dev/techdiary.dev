import { Inngest } from "inngest";
import { z } from "zod/v4";
import {
  NotificationType,
  NotificationPayload,
} from "@/backend/models/domain-models";
import { persistenceRepository } from "@/backend/persistence/persistence-repositories";
import { ActionException } from "@/backend/services/RepositoryException";
import { buildPersistableNotification } from "@/backend/services/notifications.payload";
import { deleteExpiredArticles } from "@/backend/services/article-cleanup-service";

const notificationPayloadSchema = z.object({
  article_id: z.string().optional(),
  article_handle: z.string().optional(),
  article_title: z.string().optional(),
  article_author_username: z.string().optional(),
  comment_id: z.string().optional(),
  gist_id: z.string().optional(),
  gist_title: z.string().optional(),
  reaction_type: z.string().optional(),
  actor_name: z.string().optional(),
  actor_username: z.string().optional(),
});

/** Full row, or `reaction_request` / `comment_request` (built in the worker). */
export const notificationEventSchema = z
  .object({
    recipient_id: z.string().optional(),
    actor_id: z.string().nullable().optional(),
    type: z
      .enum([
        "COMMENT_ON_ARTICLE",
        "REPLY_TO_COMMENT",
        "COMMENT_ON_GIST",
        "REACTION_ON_ARTICLE",
        "REACTION_ON_COMMENT",
        "REACTION_ON_GIST",
      ])
      .optional(),
    payload: notificationPayloadSchema.optional(),
    /** Minimal reaction event; worker loads article/comment/thread and actor display fields. */
    reaction_request: z
      .object({
        resource_id: z.string(),
        resource_type: z.enum(["ARTICLE", "COMMENT", "GIST"]),
        reaction_type: z.string(),
      })
      .optional(),
    /** Minimal comment event; worker builds recipient + payload like `kind: "comment"`. */
    comment_request: z
      .object({
        resource_id: z.string(),
        resource_type: z.enum(["ARTICLE", "COMMENT", "GIST"]),
      })
      .optional(),
  })
  .superRefine((val, ctx) => {
    const hasReaction = Boolean(val.reaction_request);
    const hasComment = Boolean(val.comment_request);
    if (hasReaction && hasComment) {
      ctx.addIssue({
        code: "custom",
        message: "Cannot set both reaction_request and comment_request",
        path: ["comment_request"],
      });
      return;
    }
    if (hasReaction) {
      if (!val.actor_id) {
        ctx.addIssue({
          code: "custom",
          message: "actor_id is required when reaction_request is set",
          path: ["actor_id"],
        });
      }
      return;
    }
    if (hasComment) {
      if (!val.actor_id) {
        ctx.addIssue({
          code: "custom",
          message: "actor_id is required when comment_request is set",
          path: ["actor_id"],
        });
      }
      return;
    }
    if (!val.recipient_id || !val.type) {
      ctx.addIssue({
        code: "custom",
        message:
          "recipient_id and type are required without reaction_request or comment_request",
        path: ["recipient_id"],
      });
    }
  });

export type NotificationEventData = z.infer<typeof notificationEventSchema>;

export const inngest = new Inngest({
  id: "techdiary",
  eventKey: process.env.INNGEST_EVENT_KEY ?? "local",
});

export const cleanupExpiredArticlesFn = inngest.createFunction(
  {
    id: "cleanup-expired-articles",
    triggers: [{ cron: "0 2 * * *" }],
  },
  async () => {
    const result = await deleteExpiredArticles();
    return { deletedCount: result.deletedCount };
  },
);

export const persistNotificationFn = inngest.createFunction(
  {
    id: "persist-notification",
    triggers: [{ event: "app/notification.requested" }],
  },
  async ({ event }: { event: { data: NotificationEventData } }) => {
    const parsed = notificationEventSchema.safeParse(event.data);
    if (!parsed.success) {
      return { skipped: true, reason: "invalid-notification-payload" };
    }

    let data = parsed.data;

    if (data.reaction_request && data.actor_id) {
      const built = await buildPersistableNotification({
        kind: "reaction",
        actorId: data.actor_id,
        resourceId: data.reaction_request.resource_id,
        resourceType: data.reaction_request.resource_type,
        reactionType: data.reaction_request.reaction_type,
      });
      if (!built) {
        return { skipped: true, reason: "reaction-notification-build-failed" };
      }
      data = {
        recipient_id: built.recipient_id,
        actor_id: built.actor_id,
        type: built.type,
        payload: built.payload,
      };
    } else if (data.comment_request && data.actor_id) {
      try {
        const built = await buildPersistableNotification({
          kind: "comment",
          actorId: data.actor_id,
          resourceId: data.comment_request.resource_id,
          resourceType: data.comment_request.resource_type,
        });
        data = {
          recipient_id: built.recipient_id,
          actor_id: built.actor_id,
          type: built.type,
          payload: built.payload,
        };
      } catch (e) {
        if (e instanceof ActionException) {
          return {
            skipped: true,
            reason: "comment-notification-build-failed",
            message: e.message,
          };
        }
        throw e;
      }
    }

    if (!data.recipient_id || !data.type) {
      return { skipped: true, reason: "missing-notification-fields" };
    }

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
  },
);
