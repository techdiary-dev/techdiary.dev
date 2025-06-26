import BaseLayout from "@/components/layout/BaseLayout";
import React from "react";
import ProfilePageAside from "./_components/ProfilePageAside";
import _t from "@/i18n/_t";
import { getUserByUsername } from "@/backend/services/user.action";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import clsx from "clsx";
import { sanitizedUsername } from "@/lib/utils";

interface ProfilePageLayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

const layout: React.FC<ProfilePageLayoutProps> = async ({
  children,
  params,
}) => {
  const _headers = await headers();
  const currentPath = _headers.get("x-current-path");
  const _params = await params;
  const username = sanitizedUsername(_params?.username);
  const profile = await getUserByUsername(username, [
    // all fields
    "id",
    "name",
    "username",
    "email",
    "profile_photo",
    "created_at",
    "updated_at",
  ]);

  if (!profile) {
    return (
      <BaseLayout>
        <div className="grid place-content-center h-screen">
          <Image
            src="/images/robots-drones-artificial-intelligence-1.png"
            alt="Error"
            width={300}
            height={300}
            className="mx-auto"
          />

          <div className="flex flex-col items-center justify-center gap-4 p-4">
            <h1 className="text-2xl text-center text-foreground flex md:block flex-col gap-2">
              <span className="bg-muted text-muted-foreground">
                @{username}
              </span>{" "}
              <span>👉 {_t("Profile not found")}</span>
            </h1>
            <p className="text-center text-muted-foreground">
              {_t("The user you are looking for does not exist")}
            </p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      {/* <pre>{JSON.stringify({ profile }, null, 2)}</pre> */}
      <div className="wrapper">
        <div className="grid grid-cols-1 gap-6 my-2 lg:my-6 md:grid-cols-12 lg:gap-10">
          <aside className="md:col-span-3 col-span-full">
            <ProfilePageAside profile={profile} />
          </aside>

          <main className="md:col-span-9 col-span-full">
            <nav className="flex items-center bg-muted rounded-tl-md rounded-tr-md">
              <Link
                href={`/@${profile?.username}`}
                className={clsx("pr-2 text-muted-foreground p-2", {
                  "border-b-4 border-primary":
                    sanitizedUsername(currentPath!) == username,
                })}
              >
                {_t("Overview")}
              </Link>
              <Link
                href={`/@${profile?.username}/articles`}
                className={clsx("pr-2 text-muted-foreground p-2", {
                  "border-b-4 border-primary":
                    sanitizedUsername(currentPath!) == `${username}articles`,
                })}
              >
                {_t("My articles")}
              </Link>
            </nav>
            {children}
          </main>
        </div>
      </div>
    </BaseLayout>
  );
};

export default layout;
