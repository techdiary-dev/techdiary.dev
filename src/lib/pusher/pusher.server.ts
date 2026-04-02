import Pusher from "pusher";
import { env } from "@/env";
import type { RealtimePusherEvent } from "./realtime-events";

export {
  REALTIME_PUSHER_EVENTS,
  type RealtimePusherEvent,
} from "./realtime-events";

/**
 * Lazy singleton for the server-side Pusher/Soketi client.
 * Returns null when Pusher is not configured (no PUSHER_APP_ID etc.),
 * so callers can gracefully skip publishing in non-realtime environments.
 */
function createPusherServer(): Pusher | null {
  const { PUSHER_APP_ID, PUSHER_APP_KEY, PUSHER_APP_SECRET } = env;
  if (!PUSHER_APP_ID || !PUSHER_APP_KEY || !PUSHER_APP_SECRET) {
    return null;
  }

  return new Pusher({
    host: env.PUSHER_WS_HOST,
    appId: PUSHER_APP_ID,
    key: PUSHER_APP_KEY,
    secret: PUSHER_APP_SECRET,
  });
}

export const pusherServer = createPusherServer();

/**
 * Best-effort publish. No-ops when Pusher is not configured; swallows errors
 * so callers (e.g. Inngest) are not broken by broker failures.
 */
export async function publishMessage(
  channel: string,
  event: RealtimePusherEvent,
  data: Record<string, unknown> = {},
): Promise<void> {
  if (!pusherServer) return;
  try {
    await pusherServer.trigger(channel, event, data);
  } catch (err) {
    console.error("[pusher] Failed to publish message:", JSON.stringify(err));
  }
}
