import { env } from "@/env";
import { generateRandomString } from "@/lib/utils";
import { cookies } from "next/headers";
import { ActionException, handleActionException } from "../RepositoryException";
import {
  GithubUserEmailAPIResponse,
  IGithubUser,
  IOAuthService,
} from "./oauth-contract";

export class GithubOAuthService implements IOAuthService<IGithubUser> {
  async getAuthorizationUrl(): Promise<string> {
    const state = generateRandomString(50);
    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      redirect_uri: env.GITHUB_CALLBACK_URL,
      scope: "read:user,user:email",
      state,
    });
    const _cookies = await cookies();
    _cookies.set("github_oauth_state", state, {
      path: "/",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async getUserInfo(code: string, state: string) {
    try {
      const _cookies = await cookies();
      const storedState = _cookies.get("github_oauth_state")?.value ?? null;

      if (code === null || state === null || storedState === null) {
        throw new ActionException("Please restart the process.");
      }
      if (state !== storedState) {
        throw new ActionException("Please restart the process.");
      }

      const githubAccessToken = await validateGitHubCode(
        code,
        env.GITHUB_CLIENT_ID,
        env.GITHUB_CLIENT_SECRET,
        env.GITHUB_CALLBACK_URL
      );

      return {
        success: true as const,
        data: await getGithubUser(githubAccessToken.access_token),
      };
    } catch (error) {
      return handleActionException(error);
    }
  }
}

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export const validateGitHubCode = async (
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<GitHubTokenResponse> => {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(
    `https://github.com/login/oauth/access_token?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to validate GitHub code");
  }

  return await response.json();
};

const getGithubUser = async (accessToken: string): Promise<IGithubUser> => {
  const userInfoAPI = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const userEmailAPI = await fetch("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userInfoAPI.ok || !userEmailAPI.ok) {
    throw new ActionException("Failed to get GitHub user");
  }

  const user = (await userInfoAPI.json()) as IGithubUser;
  const emails = (await userEmailAPI.json()) as GithubUserEmailAPIResponse[];

  const primaryEmail = emails.find((e) => e.primary);
  user.email = primaryEmail?.email!;

  return user;
};
