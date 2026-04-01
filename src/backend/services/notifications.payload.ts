import { eq } from "sqlkit";
import { NotificationPayload, NotificationType } from "../models/domain-models";
import { persistenceRepository } from "../persistence/persistence-repositories";
import { ActionException } from "./RepositoryException";
import { commentThreadRootResource } from "./comment-thread-root";

/**
 * Cheap existence check before inserting a comment (polymorphic `resource_id` has no FK).
 * Full notification payload is built later in Inngest.
 */
export async function assertCommentResourceExists(
  resourceId: string,
  resourceType: "ARTICLE" | "COMMENT" | "GIST",
): Promise<void> {
  switch (resourceType) {
    case "ARTICLE": {
      const [row] = await persistenceRepository.article.find({
        where: eq("id", resourceId),
        limit: 1,
        columns: ["id"],
      });
      if (!row) throw new ActionException("Resource not found");
      return;
    }
    case "COMMENT": {
      const [row] = await persistenceRepository.comment.find({
        where: eq("id", resourceId),
        limit: 1,
        columns: ["id"],
      });
      if (!row) throw new ActionException("Parent comment not found");
      return;
    }
    case "GIST": {
      const [row] = await persistenceRepository.gist.find({
        where: eq("id", resourceId),
        limit: 1,
        columns: ["id"],
      });
      if (!row) throw new ActionException("Resource not found");
      return;
    }
    default: {
      const _exhaustive: never = resourceType;
      void _exhaustive;
      throw new ActionException("Invalid resource type");
    }
  }
}

/** Row shape for `notifications` insert + Inngest full events. */
export type PersistableNotification = {
  recipient_id: string;
  actor_id: string;
  type: NotificationType;
  payload: NotificationPayload;
};

export type BuildPersistableNotificationInput =
  | {
      kind: "reaction";
      actorId: string;
      resourceId: string;
      resourceType: "ARTICLE" | "COMMENT" | "GIST";
      reactionType: string;
    }
  | {
      kind: "comment";
      actorId: string;
      resourceId: string;
      resourceType: "ARTICLE" | "COMMENT" | "GIST";
    };

/**
 * Single entry point for notification DB payload (+ recipient + type).
 * Not `"use server"` — safe for Inngest and internal calls.
 *
 * - `reaction`: returns `null` if references are missing (worker skips).
 * - `comment`: throws `ActionException` like `createMyComment` when a resource is missing.
 */
export async function buildPersistableNotification(
  input: Extract<BuildPersistableNotificationInput, { kind: "comment" }>,
): Promise<PersistableNotification>;
export async function buildPersistableNotification(
  input: Extract<BuildPersistableNotificationInput, { kind: "reaction" }>,
): Promise<PersistableNotification | null>;

export async function buildPersistableNotification(
  input: BuildPersistableNotificationInput,
): Promise<PersistableNotification | null> {
  switch (input.kind) {
    case "reaction":
      return buildReactionNotification(input);
    case "comment":
      return buildCommentNotification(input);
    default: {
      const _exhaustive: never = input;
      return _exhaustive;
    }
  }
}

async function buildReactionNotification(
  input: Extract<BuildPersistableNotificationInput, { kind: "reaction" }>,
): Promise<PersistableNotification | null> {
  const { actorId, resourceId, resourceType, reactionType } = input;

  const [actor] = await persistenceRepository.user.find({
    where: eq("id", actorId),
    limit: 1,
    columns: ["id", "name", "username"],
  });
  if (!actor) return null;

  const payload: NotificationPayload = { reaction_type: reactionType };
  let recipientId: string | null = null;
  let type: NotificationType;

  switch (resourceType) {
    case "ARTICLE": {
      type = "REACTION_ON_ARTICLE";
      const [article] = await persistenceRepository.article.find({
        where: eq("id", resourceId),
        limit: 1,
        columns: ["id", "author_id", "title", "handle"],
      });
      if (!article) return null;
      recipientId = article.author_id;
      payload.article_id = article.id;
      payload.article_handle = article.handle;
      payload.article_title = article.title;
      const [articleAuthor] = await persistenceRepository.user.find({
        where: eq("id", article.author_id),
        limit: 1,
        columns: ["username"],
      });
      if (articleAuthor?.username) {
        payload.article_author_username = articleAuthor.username;
      }
      break;
    }
    case "COMMENT": {
      type = "REACTION_ON_COMMENT";
      const [comment] = await persistenceRepository.comment.find({
        where: eq("id", resourceId),
        limit: 1,
        columns: ["id", "user_id"],
      });
      if (!comment) return null;
      recipientId = comment.user_id;
      payload.comment_id = comment.id;
      const root = await commentThreadRootResource(comment.id);
      switch (root?.kind) {
        case "ARTICLE":
          payload.article_id = root.article_id;
          payload.article_handle = root.article_handle;
          payload.article_title = root.article_title;
          if (root.article_author_username) {
            payload.article_author_username = root.article_author_username;
          }
          break;
        case "GIST":
          payload.gist_id = root.gist_id;
          payload.gist_title = root.gist_title;
          break;
        default:
          break;
      }
      break;
    }
    case "GIST": {
      type = "REACTION_ON_GIST";
      const [gist] = await persistenceRepository.gist.find({
        where: eq("id", resourceId),
        limit: 1,
        columns: ["id", "owner_id", "title"],
      });
      if (!gist) return null;
      recipientId = gist.owner_id;
      payload.gist_id = gist.id;
      payload.gist_title = gist.title;
      break;
    }
    default: {
      const _exhaustive: never = resourceType;
      return _exhaustive;
    }
  }

  if (!recipientId) return null;

  return {
    recipient_id: recipientId,
    actor_id: actorId,
    type,
    payload: {
      ...payload,
      actor_name: actor.name,
      actor_username: actor.username,
    },
  };
}

async function buildCommentNotification(
  input: Extract<BuildPersistableNotificationInput, { kind: "comment" }>,
): Promise<PersistableNotification> {
  const { actorId, resourceId, resourceType } = input;

  const [actor] = await persistenceRepository.user.find({
    where: eq("id", actorId),
    limit: 1,
    columns: ["id", "name", "username"],
  });

  let recipientId: string;
  let type: NotificationType;
  let payload: NotificationPayload;

  switch (resourceType) {
    case "ARTICLE": {
      const [article] = await persistenceRepository.article.find({
        where: eq("id", resourceId),
        limit: 1,
        columns: ["id", "author_id", "title", "handle"],
      });
      if (!article) throw new ActionException("Resource not found");
      recipientId = article.author_id;
      const [articleAuthor] = await persistenceRepository.user.find({
        where: eq("id", article.author_id),
        limit: 1,
        columns: ["id", "username"],
      });
      type = "COMMENT_ON_ARTICLE";
      payload = {
        article_id: article.id,
        article_handle: article.handle,
        article_title: article.title,
        ...(articleAuthor?.username
          ? { article_author_username: articleAuthor.username }
          : {}),
      };
      break;
    }
    case "COMMENT": {
      const [parentComment] = await persistenceRepository.comment.find({
        where: eq("id", resourceId),
        limit: 1,
        columns: ["id", "user_id"],
      });
      if (!parentComment) {
        throw new ActionException("Parent comment not found");
      }
      recipientId = parentComment.user_id;
      type = "REPLY_TO_COMMENT";
      payload = { comment_id: parentComment.id };
      const root = await commentThreadRootResource(parentComment.id);
      switch (root?.kind) {
        case "ARTICLE":
          payload = {
            ...payload,
            article_id: root.article_id,
            article_handle: root.article_handle,
            article_title: root.article_title,
            ...(root.article_author_username
              ? { article_author_username: root.article_author_username }
              : {}),
          };
          break;
        case "GIST":
          payload = {
            ...payload,
            gist_id: root.gist_id,
            gist_title: root.gist_title,
          };
          break;
        default:
          break;
      }
      break;
    }
    case "GIST": {
      const [gist] = await persistenceRepository.gist.find({
        where: eq("id", resourceId),
        limit: 1,
        columns: ["id", "owner_id", "title"],
      });
      if (!gist) throw new ActionException("Resource not found");
      recipientId = gist.owner_id;
      type = "COMMENT_ON_GIST";
      payload = { gist_id: gist.id, gist_title: gist.title };
      break;
    }
    default: {
      const _exhaustive: never = resourceType;
      return _exhaustive;
    }
  }

  return {
    recipient_id: recipientId,
    actor_id: actorId,
    type,
    payload: {
      ...payload,
      actor_name: actor?.name,
      actor_username: actor?.username,
    },
  };
}
