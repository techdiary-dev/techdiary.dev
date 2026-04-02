import { pusherServer } from "@/lib/pusher.server";
import { authID } from "@/backend/services/session.actions";
import { NextRequest, NextResponse } from "next/server";

/**
 * Pusher private-channel auth endpoint.
 * Pusher-js POSTs `socket_id` and `channel_name` as application/x-www-form-urlencoded.
 * We verify the user's session and only sign subscriptions to the caller's own channel.
 */
export async function POST(req: NextRequest) {
  if (!pusherServer) {
    return new NextResponse("Realtime not configured", { status: 503 });
  }

  const userId = await authID();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id") ?? "";
  const channel = params.get("channel_name") ?? "";

  // Only allow subscribing to the caller's own user channel
  if (channel !== `private-user.${userId}`) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const authResponse = pusherServer.authorizeChannel(socketId, channel);
  return NextResponse.json(authResponse);
}
