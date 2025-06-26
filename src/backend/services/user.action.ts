"use server";

import { and, desc, eq } from "sqlkit";
import { z } from "zod";
import { User } from "../models/domain-models";
import { persistenceRepository } from "../persistence/persistence-repositories";
import { ActionException, handleActionException } from "./RepositoryException";
import { UserActionInput } from "./inputs/user.input";
import { drizzleClient } from "@/backend/persistence/clients";
import { usersTable } from "@/backend/persistence/schemas";
import { authID } from "./session.actions";
import { filterUndefined } from "@/lib/utils";
import { ActionResult } from "next/dist/server/app-render/types";
import { ActionResponse } from "../models/action-contracts";

/**
 * Creates or syncs a user account from a social login provider.
 * If the user exists, links their social account. If not, creates a new user and social link.
 *
 * @param _input - The social user data containing service, uid and profile info, validated against UserRepositoryInput.syncSocialUserInput schema
 * @returns Promise<{user: User, userSocial: UserSocial}> - The user and their social account link
 * @throws {RepositoryException} If user creation/sync fails or validation fails
 */
export async function bootSocialUser(
  _input: z.infer<typeof UserActionInput.syncSocialUserInput>
) {
  try {
    const input = await UserActionInput.syncSocialUserInput.parseAsync(_input);
    let [user] = await persistenceRepository.user.find({
      where: eq("email", input.email),
      columns: ["id", "name", "username", "email"],
      orderBy: [desc("created_at")],
      limit: 1,
    });

    if (!user) {
      user = (
        await persistenceRepository.user.insert([
          {
            name: input.name,
            username: input.username,
            email: input.email,
            profile_photo: input.profile_photo,
            bio: input.bio ?? "",
          },
        ])
      )?.rows?.[0];
    }

    // check user has social account
    const [userSocial] = await persistenceRepository.userSocial.find({
      where: and(
        eq("service", input.service),
        eq("service_uid", input.service_uid)
      ),
      columns: ["id", "service", "service_uid", "user_id"],
      limit: 1,
    });

    if (!userSocial) {
      await persistenceRepository.userSocial.insert([
        {
          service: input.service,
          service_uid: input.service_uid,
          user_id: user.id,
        },
      ]);
    }

    return {
      success: true as const,
      data: { user, userSocial },
    };
  } catch (error) {
    return handleActionException(error);
  }
}

/**
 * Updates a user's profile information.
 *
 * @param _input - The user profile data to update, validated against UserRepositoryInput.updateUserProfileInput schema
 * @returns Promise<User> - The updated user
 * @throws {RepositoryException} If update fails or validation fails
 */
export async function updateMyProfile(
  _input: z.infer<typeof UserActionInput.updateMyProfileInput>
) {
  const sessionUser = await authID();
  if (!sessionUser) {
    throw new ActionException(`User not authenticated`);
  }

  const input = await UserActionInput.updateMyProfileInput.parseAsync(_input);

  const updatedUser = await persistenceRepository.user.update({
    where: eq("id", sessionUser!),
    data: filterUndefined<User>({
      name: input.name,
      username: input.username,
      email: input.email,
      profile_photo: input.profile_photo,
      education: input.education,
      designation: input.designation,
      bio: input.bio,
      website_url: input.websiteUrl,
      location: input.location,
      social_links: input.social_links,
      profile_readme: input.profile_readme,
      skills: input.skills,
    }),
  });

  return updatedUser?.rows?.[0];
}

/**
 * Retrieves a user by their ID.
 *
 * @param id - The user's ID
 * @returns Promise<User | null> - The user if found, null otherwise
 * @throws {RepositoryException} If a query fails
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const [user] = await persistenceRepository.user.find({
      where: eq("id", id),
      limit: 1,
    });
    return user;
  } catch (error) {
    handleActionException(error);
    return null;
  }
}

/**
 * Retrieves a user by their username.
 *
 * @param username - The user's username
 * @returns Promise<User | null> - The user if found, null otherwise
 * @throws {RepositoryException} If query fails
 */
export async function getUserByUsername(
  username: string,
  columns?: (keyof User)[]
): Promise<User | null> {
  try {
    const [user] = await persistenceRepository.user.find({
      operationName: "getUserByUsername",
      where: eq("username", username),
      limit: 1,
      columns: columns ? columns : undefined,
    });
    return user;
  } catch (error) {
    handleActionException(error);
    return null;
  }
}

/**
 * Retrieves a user by their email.
 *
 * @param email - The user's email
 * @returns Promise<User | null> - The user if found, null otherwise
 * @throws {RepositoryException} If query fails
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const [user] = await persistenceRepository.user.find({
      where: eq("email", email),
      limit: 1,
    });
    return user;
  } catch (error) {
    handleActionException(error);
    return null;
  }
}

/**
 * Gets a paginated list of users.
 *
 * @param page - The page number (1-based)
 * @param limit - Number of users per page
 * @returns Promise<{users: User[], total: number}> - List of users and total count
 * @throws {RepositoryException} If query fails
 */
export async function getUsers(page: number = 1, limit: number = 10) {
  try {
    return persistenceRepository.user.paginate({
      limit,
      orderBy: [desc("created_at")],
      columns: [
        "id",
        "name",
        "username",
        "email",
        "profile_photo",
        "created_at",
      ],
    });
  } catch (error) {
    handleActionException(error);
    return null;
  }
}
