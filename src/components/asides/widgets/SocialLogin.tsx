"use client";

import { userAtom } from "@/store/user.atom";
import { BookmarkIcon, DashboardIcon, PersonIcon } from "@radix-ui/react-icons";
import { useAtomValue } from "jotai";
import Link from "next/link";
import React from "react";

const SocialLogin = () => {
  const currentUser = useAtomValue(userAtom);
  const [loadingGithub, setLoadingGithub] = React.useState(false);
  const [loadingGoogle, setLoadingGoogle] = React.useState(false);

  const socialLogin = (service: "github" | "google") => {
    if (service == "google") {
      setLoadingGoogle(true);
    }

    if (service == "github") {
      setLoadingGithub(true);
    }
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/oauth/${service}`;
  };

  if (currentUser) {
    return (
      <div className=" flex flex-col items-center gap-2 app-border-color border p-4 rounded-md">
        <div className="relative">
          <img
            className="rounded-md w-full"
            src={
              currentUser?.profilePhoto ||
              `https://api.dicebear.com/8.x/initials/svg?seed=${currentUser?.username}`
            }
            alt={currentUser?.username || ""}
          />

          <div className="absolute bottom-0 left-0 w-full p-3 profile-card-ribon">
            <p className="text-white font-semibold text-xl">
              {currentUser?.name}
            </p>
            <Link href={`/@${currentUser?.username}`}>
              @{currentUser?.username}
            </Link>{" "}
          </div>
        </div>

        <div className="flex flex-col gap-2 items-start w-full">
          <Link
            className="text-forground flex gap-2 items-center"
            href={`/dashboard`}
          >
            <PersonIcon className="h-4 w-4" />
            <p>প্রোফাইল</p>
          </Link>
          <Link
            className="text-forground flex gap-2 items-center"
            href={`/dashboard`}
          >
            <DashboardIcon className="h-4 w-4" />
            <p>ড্যাসবোর্ড</p>
          </Link>

          <Link
            className="text-forground flex gap-2 items-center"
            href={`/dashboard`}
          >
            <BookmarkIcon className="h-4 w-4" />
            <p>বুকমার্ক</p>
          </Link>
        </div>
      </div>
    );
  }

  if (!currentUser)
    return (
      <div className="login">
        <button
          className="login__button login__button--github"
          onClick={() => socialLogin("github")}
        >
          {loadingGithub ? (
            <svg
              className="w-5 h-5 mr-2 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx={12}
                cy={12}
                r={10}
                stroke="currentColor"
                strokeWidth={4}
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              v-else=""
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="login__icon login__icon--github"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          )}
          <span className="login__label">গিটহাব দিয়ে লগইন</span>
        </button>
        <button
          className="login__button login__button--google"
          onClick={() => socialLogin("google")}
        >
          {loadingGoogle ? (
            <svg
              className="w-5 h-5 mr-2 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx={12}
                cy={12}
                r={10}
                stroke="currentColor"
                strokeWidth={4}
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              v-else=""
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="login__icon login__icon--google"
            >
              <title>Google icon</title>
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
          )}
          <span className="login__label">গুগল দিয়ে লগইন</span>
        </button>

        <div>
          <Link
            href={`/auth/login`}
            className="flex gap-2 items-center text-primary underline"
          >
            ইমেল দিয়ে লগইন করুন
          </Link>
        </div>
      </div>
    );
};

export default SocialLogin;
