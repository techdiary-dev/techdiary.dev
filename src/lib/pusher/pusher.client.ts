import Pusher from "pusher-js";
import { env } from "@/env";
import type {
  RealtimeListenHandlers,
  RealtimePusherEvent,
} from "./realtime-events";

export {
  REALTIME_PUSHER_EVENTS,
  type RealtimeListenHandlers,
  type RealtimePusherEvent,
} from "./realtime-events";

let _pusherClient: Pusher | null = null;

function getPusherClient(): Pusher | null {
  if (typeof window === "undefined") return null;

  if (_pusherClient) return _pusherClient;

  const key = env.NEXT_PUBLIC_PUSHER_APP_KEY;
  if (!key) return null;

  // pusher-js always requires cluster; use empty string as placeholder when
  // connecting to a self-hosted Soketi/compatible broker via wsHost.
  _pusherClient = new Pusher(key, {
    cluster: "mt1",
    authEndpoint: "/api/socket/auth",
    wsHost: env.NEXT_PUBLIC_PUSHER_WS_HOST,
    enabledTransports: ["ws", "wss"],
  });

  return _pusherClient;
}

export function listenChannel(
  channel: string,
  handlers: RealtimeListenHandlers,
): () => void {
  const pusher = getPusherClient();
  if (!pusher) {
    return () => {};
  }

  const ch = pusher.subscribe(channel);
  for (const event of Object.keys(handlers) as RealtimePusherEvent[]) {
    const fn = handlers[event];
    if (fn) ch.bind(event, fn);
  }

  return () => {
    for (const event of Object.keys(handlers) as RealtimePusherEvent[]) {
      const fn = handlers[event];
      if (fn) ch.unbind(event, fn);
    }
    pusher.unsubscribe(channel);
  };
}

/** Server-side publish: `publishMessage` in `./pusher.server` (cannot run in the browser). */
