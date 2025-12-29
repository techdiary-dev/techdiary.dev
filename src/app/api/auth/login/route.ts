import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import * as sessionActions from "@/backend/services/session.actions";

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const next = url.searchParams.get("next");

  // Save redirect URL for after auth
  if (next) {
    await sessionActions.setAfterAuthRedirect(next);
  }

  const signInUrl = await getSignInUrl();
  return redirect(signInUrl);
};
