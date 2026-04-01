import Pusher from "pusher-js";
import { env } from "@/env";

let _pusherClient: Pusher | null = null;

/**
 * Returns a shared Pusher/Soketi client instance.
 * Returns null when the public app key is not configured.
 */
export function getPusherClient(): Pusher | null {
  if (typeof window === "undefined") return null;

  const key = env.NEXT_PUBLIC_PUSHER_APP_KEY;
  if (!key) return null;

  if (_pusherClient) return _pusherClient;

  const forceTLS = env.NEXT_PUBLIC_PUSHER_FORCE_TLS !== "false";
  const port = env.NEXT_PUBLIC_PUSHER_PORT
    ? Number(env.NEXT_PUBLIC_PUSHER_PORT)
    : undefined;

  // pusher-js always requires cluster; use empty string as placeholder when
  // connecting to a self-hosted Soketi/compatible broker via wsHost.
  _pusherClient = new Pusher(key, {
    cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "mt1",
    authEndpoint: "/api/pusher/auth",
    ...(env.NEXT_PUBLIC_PUSHER_HOST && {
      wsHost: env.NEXT_PUBLIC_PUSHER_HOST,
      wsPort: port,
      wssPort: port,
      enabledTransports: ["ws", "wss"],
    }),
    forceTLS,
  });

  return _pusherClient;
}
