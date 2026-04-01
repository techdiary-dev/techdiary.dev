"use server";

import z from "zod/v4";
import { and, eq } from "sqlkit";
import { NotificationActionInput } from "./inputs/notification.input";
import { authID } from "./session.actions";
import { ActionException, handleActionException } from "./RepositoryException";
import { persistenceRepository } from "../persistence/persistence-repositories";
import { pgClient } from "../persistence/clients";
import { ActionResponse } from "../models/action-contracts";
import { Notification } from "../models/domain-models";

const sql = String.raw;

export async function listMyNotifications(
  _input: z.infer<typeof NotificationActionInput.list>
) {
  try {
    const userId = await authID();
    if (!userId) throw new ActionException("Unauthorized");

    const input = await NotificationActionInput.list.parseAsync(_input);
    const offset = input.page > 1 ? (input.page - 1) * input.limit : 0;

    const countQuery = sql`
      SELECT COUNT(*) AS total
      FROM notifications
      WHERE recipient_id = $1
    `;
    const countResult = await pgClient.executeSQL<{ total: string }>(countQuery, [userId]);
    const totalCount = Number(countResult?.rows?.[0]?.total ?? 0);
    const totalPages = Math.ceil(totalCount / input.limit);

    const listQuery = sql`
      SELECT
        n.id,
        n.recipient_id,
        n.actor_id,
        n.type,
        n.payload,
        n.read_at,
        n.created_at,
        CASE WHEN n.actor_id IS NOT NULL THEN
          json_build_object(
            'id', u.id,
            'name', u.name,
            'username', u.username
          )
        ELSE NULL END AS actor
      FROM notifications n
      LEFT JOIN users u ON u.id = n.actor_id
      WHERE n.recipient_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const listResult = await pgClient.executeSQL<Notification>(listQuery, [
      userId,
      input.limit,
      offset,
    ]);
    const nodes = (listResult?.rows ?? []) as Notification[];

    return {
      nodes,
      meta: {
        totalCount,
        currentPage: input.page,
        totalPages,
        hasNextPage: input.page < totalPages,
      },
    };
  } catch (error) {
    return handleActionException(error);
  }
}

export async function markNotificationRead(
  _input: z.infer<typeof NotificationActionInput.markRead>
): Promise<ActionResponse<{ id: string }>> {
  try {
    const userId = await authID();
    if (!userId) throw new ActionException("Unauthorized");

    const input = await NotificationActionInput.markRead.parseAsync(_input);

    await persistenceRepository.notification.update({
      where: and(eq("id", input.id), eq("recipient_id", userId)),
      data: { read_at: new Date() },
    });

    return { success: true, data: { id: input.id } };
  } catch (error) {
    return handleActionException(error);
  }
}

export async function markAllNotificationsRead(): Promise<
  ActionResponse<{ count: number }>
> {
  try {
    const userId = await authID();
    if (!userId) throw new ActionException("Unauthorized");

    const query = sql`
      UPDATE notifications
      SET read_at = NOW()
      WHERE recipient_id = $1 AND read_at IS NULL
    `;
    const result = await pgClient.executeSQL<never>(query, [userId]);
    const count = result?.rowCount ?? 0;

    return { success: true, data: { count } };
  } catch (error) {
    return handleActionException(error);
  }
}

export async function unreadNotificationCount(): Promise<
  ActionResponse<{ count: number }>
> {
  try {
    const userId = await authID();
    if (!userId) return { success: true, data: { count: 0 } };

    const query = sql`
      SELECT COUNT(*) AS count
      FROM notifications
      WHERE recipient_id = $1 AND read_at IS NULL
    `;
    const result = await pgClient.executeSQL<{ count: string }>(query, [userId]);
    const count = Number(result?.rows?.[0]?.count ?? 0);

    return { success: true, data: { count } };
  } catch (error) {
    return handleActionException(error);
  }
}
