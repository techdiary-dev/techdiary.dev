import Pusher from "pusher-js";
import { env } from "@/env";

let _pusherClient: Pusher | null = null;

/**
 * Returns a shared Pusher/Soketi client instance.
 * Returns null when the public app key is not configured.
 */
export function getPusherClient(): Pusher | null {
  if (typeof window === "undefined") return null;

  if (_pusherClient) return _pusherClient;

  // pusher-js always requires cluster; use empty string as placeholder when
  // connecting to a self-hosted Soketi/compatible broker via wsHost.
  _pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_APP_KEY ?? "", {
    cluster: "mt1",
    authEndpoint: "/api/socket/auth",
    wsHost: env.NEXT_PUBLIC_PUSHER_HOST,
    enabledTransports: ["ws", "wss"],
  });

  return _pusherClient;
}
