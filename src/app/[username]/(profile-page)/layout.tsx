import { getUserByUsername } from "@/backend/services/user.action";
import BaseLayout from "@/components/layout/BaseLayout";
import _t from "@/i18n/_t";
import { sanitizedUsername } from "@/lib/utils";
import { Metadata } from "next";
import Image from "next/image";
import React from "react";
import ProfileNavigation from "./_components/ProfileNavigation";
import ProfilePageAside from "./_components/ProfilePageAside";

interface ProfilePageLayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const sanitized = sanitizedUsername(username);
  const profile = await getUserByUsername(sanitized, ["name", "username", "bio"]);

  if (!profile) {
    return { title: `@${sanitized} — TechDiary` };
  }

  return {
    title: `${profile.name} (@${profile.username})`,
    description: profile.bio
      ? profile.bio
      : `${profile.name}-এর লেখা পড়ুন TechDiary-তে`,
    openGraph: {
      title: `${profile.name} (@${profile.username}) — TechDiary`,
      description: profile.bio ?? `Articles by ${profile.name} on TechDiary`,
      url: `https://www.techdiary.dev/@${profile.username}`,
      type: "profile",
    },
  };
}

const layout: React.FC<ProfilePageLayoutProps> = async ({
  children,
  params,
}) => {
  const _params = await params;
  const username = sanitizedUsername(_params?.username);
  const profile = await getUserByUsername(username, [
    "id",
    "name",
    "username",
    "email",
    "profile_photo",
    "bio",
    "designation",
    "website_url",
    "education",
    "location",
    "social_links",
    "skills",
    "is_verified",
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
      <div className="wrapper">
        <div className="grid grid-cols-1 gap-6 my-2 lg:my-6 md:grid-cols-12 lg:gap-10">
          <aside className="md:col-span-3 col-span-full">
            <ProfilePageAside profile={profile} />
          </aside>

          <main className="md:col-span-9 col-span-full">
            <ProfileNavigation username={username} />
            {children}
          </main>
        </div>
      </div>
    </BaseLayout>
  );
};

export default layout;
