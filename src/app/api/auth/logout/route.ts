import { signOut, getWorkOS } from "@workos-inc/authkit-nextjs";
import { cookies } from "next/headers";
import { eq } from "sqlkit";
import { persistenceRepository } from "@/backend/persistence/persistence-repositories";
import { USER_SESSION_KEY } from "@/backend/services/action-type";

export const GET = async () => {
  const _cookies = await cookies();
  const token = _cookies.get(USER_SESSION_KEY.SESSION_TOKEN)?.value ?? null;

  // Clear local session from database
  if (token) {
    try {
      await persistenceRepository.userSession.delete({
        where: eq("token", token),
      });
    } catch (error) {
      // Ignore errors during cleanup
    }
  }

  // Clear all session cookies (local + WorkOS)
  _cookies.delete(USER_SESSION_KEY.SESSION_TOKEN);
  _cookies.delete(USER_SESSION_KEY.SESSION_USER_ID);

  // Sign out from WorkOS and redirect to home
  return signOut({ returnTo: "/" });
};
