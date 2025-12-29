import { getWorkOS } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";
import * as sessionActions from "@/backend/services/session.actions";
import * as userActions from "@/backend/services/user.action";
import * as storageActions from "@/backend/services/storage.action";
import { DIRECTORY_NAME } from "@/backend/models/domain-models";

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const afterAuthRedirect = await sessionActions.getAfterAuthRedirect();

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  try {
    const workos = getWorkOS();

    // Exchange code for user info
    const { user: workosUser } =
      await workos.userManagement.authenticateWithCode({
        code,
        clientId: process.env.WORKOS_CLIENT_ID!,
      });

    // Upload profile picture to our storage if available
    let profilePhoto:
      | { key: string; provider: "r2" | "cloudinary" | "direct" }
      | undefined;

    if (workosUser.profilePictureUrl) {
      const uploadResult = await storageActions.uploadByUrl({
        url: workosUser.profilePictureUrl,
        key: `${DIRECTORY_NAME.USER_AVATARS}/${crypto.randomUUID()}.jpeg`,
      });

      if (uploadResult.success) {
        profilePhoto = {
          key: uploadResult.data.key,
          provider: uploadResult.data.provider as
            | "r2"
            | "cloudinary"
            | "direct",
        };
      }
    }

    // Build user data from WorkOS response
    const displayName =
      [workosUser.firstName, workosUser.lastName].filter(Boolean).join(" ") ||
      workosUser.email.split("@")[0];

    const username = workosUser.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    // Find or create user by email, and update/set auth_id
    const bootedUser = await userActions.bootWorkOSUser({
      auth_id: workosUser.id,
      name: displayName,
      username,
      email: workosUser.email,
      profile_photo: profilePhoto,
    });

    if (!bootedUser.success) {
      return NextResponse.json({ error: bootedUser.error }, { status: 500 });
    }

    // Create local session (same as GitHub flow)
    await sessionActions.createLoginSession({
      user_id: bootedUser.data.user.id,
      request,
    });

    // Redirect to original destination or home
    return new Response(null, {
      status: 302,
      headers: {
        Location: afterAuthRedirect ?? "/",
      },
    });
  } catch (error) {
    console.error("WorkOS auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
};
