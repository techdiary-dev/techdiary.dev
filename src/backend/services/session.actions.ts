"use server";

import { env } from "@/env";
import { generateRandomString } from "@/lib/utils";
import { cookies } from "next/headers";
import { userAgent } from "next/server";
import { cache } from "react";
import { eq } from "sqlkit";
import { z } from "zod/v4";
import { persistenceRepository } from "../persistence/persistence-repositories";
import { ActionException, handleActionException } from "./RepositoryException";
import { SessionResult, USER_SESSION_KEY } from "./action-type";
import { UserSessionInput } from "./inputs/session.input";
import getFileUrl from "@/utils/getFileUrl";
import * as kv from "./kv.action";
/**
 * Creates a new login session for a user and sets a session cookie.
 *
 * @param _input - The session data containing user_id and request object, validated against UserSessionInput.createLoginSessionInput schema
 * @returns Promise<void>
 * @throws {RepositoryException} If session creation fails or validation fails
 */
export async function createLoginSession(
  _input: z.infer<typeof UserSessionInput.createLoginSessionInput>
) {
  const _cookies = await cookies();
  const token = generateRandomString(120);
  try {
    const input =
      await UserSessionInput.createLoginSessionInput.parseAsync(_input);
    const agent = userAgent(input.request);
    const insertData = await persistenceRepository.userSession.insert([
      {
        token,
        user_id: input.user_id,
        device: `${agent.os.name} ${agent.browser.name}`,
        ip: input.request.headers.get("x-forwarded-for") ?? "",
        last_action_at: new Date(),
      },
    ]);
    _cookies.set(USER_SESSION_KEY.SESSION_TOKEN, token, {
      path: "/",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    _cookies.set(USER_SESSION_KEY.SESSION_USER_ID, input.user_id, {
      path: "/",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    return {
      success: true as const,
      data: insertData.rows,
    };
  } catch (error) {
    return handleActionException(error);
  }
}

export async function createLoginSessionForBackdoor(
  _input: z.infer<typeof UserSessionInput.createBackdoorLoginSessionInput>
) {
  const _cookies = await cookies();
  const token = generateRandomString(120);
  try {
    const input =
      await UserSessionInput.createBackdoorLoginSessionInput.parseAsync(_input);
    const db_secret = await kv.get("backdoor_secret");
    if (!db_secret) {
      throw new ActionException("No secret in db");
    }

    if (db_secret != input.secret) {
      throw new ActionException("Invalid secret");
    }

    const insertData = await persistenceRepository.userSession.insert([
      {
        token,
        user_id: input.user_id,
        last_action_at: new Date(),
      },
    ]);
    _cookies.set(USER_SESSION_KEY.SESSION_TOKEN, token, {
      path: "/",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    _cookies.set(USER_SESSION_KEY.SESSION_USER_ID, input.user_id, {
      path: "/",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    return {
      success: true as const,
      data: insertData.rows,
    };
  } catch (error) {
    return handleActionException(error);
  }
}

export const validateSessionToken = async (
  token: string
): Promise<SessionResult> => {
  const [session] = await persistenceRepository.userSession.find({
    operationName: "validateSessionToken/userSession.find",
    limit: 1,
    where: eq("token", token),
    columns: ["id", "user_id", "token", "device"],
  });
  if (!session) {
    return { session: null, user: null };
  }

  await persistenceRepository.userSession.update({
    operationName: "validateSessionToken/userSession.update",
    where: eq("id", session.id),
    data: {
      last_action_at: new Date(),
    },
  });

  const [user] = await persistenceRepository.user.find({
    operationName: "validateSessionToken/user.find",
    limit: 1,
    where: eq("id", session.user_id),
    columns: ["id", "name", "username", "email", "profile_photo"],
  });

  return {
    session: {
      id: session.id,
      user_id: session.user_id,
      token: session.token,
    },
    user: {
      id: user?.id,
      name: user?.name,
      username: user?.username,
      email: user?.email,
      profile_photo_url: getFileUrl(user?.profile_photo),
    },
  };
};

/**
 * Get the current session.
 * @returns - The current session.
 */
export const getSession = cache(async (): Promise<SessionResult> => {
  const _cookies = await cookies();
  const token = _cookies.get(USER_SESSION_KEY.SESSION_TOKEN)?.value ?? null;
  if (!token) {
    return { session: null, user: null };
  }
  const result = await validateSessionToken(token);

  if (!result) {
    _cookies.delete(USER_SESSION_KEY.SESSION_TOKEN);
  }

  return result;
});

/**
 * Get the current session user ID.
 * @returns - The current session user ID.
 */
export const authID = cache(async (): Promise<string | null> => {
  const _cookies = await cookies();
  const userId = _cookies.get(USER_SESSION_KEY.SESSION_USER_ID)?.value ?? null;

  // if (!userId) {
  //   throw new Error("Unauthorized");
  // }

  return userId;
});

export const deleteLoginSession = async () => {
  const _cookies = await cookies();
  const token = _cookies.get(USER_SESSION_KEY.SESSION_TOKEN)?.value ?? null;
  if (!token) {
    return;
  }

  try {
    await persistenceRepository.userSession.delete({
      where: eq("token", token),
    });
  } catch (error) {
  } finally {
    _cookies.delete(USER_SESSION_KEY.SESSION_TOKEN);
    _cookies.delete(USER_SESSION_KEY.SESSION_USER_ID);
  }
};

export const deleteSession = async (sessionId: string) => {
  try {
    await persistenceRepository.userSession.delete({
      where: eq("id", sessionId),
    });
  } catch (error) {}
};

export const mySessions = async () => {
  const _cookies = await cookies();
  const user_id = _cookies.get(USER_SESSION_KEY.SESSION_USER_ID)?.value ?? null;
  if (!user_id) {
    return [];
  }

  return persistenceRepository.userSession.find({
    where: eq("user_id", user_id),
    limit: -1,
  });
};

/**
 * Set the URL to redirect to after authentication.
 * @param url - The URL to redirect to after authentication.
 */
export const setAfterAuthRedirect = async (url: string) => {
  const _cookies = await cookies();
  _cookies.set("next", url);
};

/**
 * Get the URL to redirect to after authentication.
 * @returns - The URL to redirect to after authentication.
 */
export const getAfterAuthRedirect = async () => {
  const _cookies = await cookies();
  const value = _cookies.get("next")?.value;
  return value !== "null" ? value : null;
};
