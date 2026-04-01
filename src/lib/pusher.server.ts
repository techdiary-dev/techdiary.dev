import Pusher from "pusher";
import { env } from "@/env";

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

  const base = {
    appId: PUSHER_APP_ID,
    key: PUSHER_APP_KEY,
    secret: PUSHER_APP_SECRET,
    useTLS: env.PUSHER_USE_TLS !== "false",
  };

  if (env.PUSHER_HOST) {
    return new Pusher({ ...base, host: env.PUSHER_HOST, port: env.PUSHER_PORT });
  }

  return new Pusher({ ...base, cluster: env.PUSHER_CLUSTER ?? "mt1" });
}

export const pusherServer = createPusherServer();
