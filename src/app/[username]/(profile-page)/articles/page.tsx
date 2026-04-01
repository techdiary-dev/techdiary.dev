import { getUserByUsername } from "@/backend/services/user.action";
import { sanitizedUsername } from "@/lib/utils";
import React from "react";
import UserArticleFeed from "./UserArticleFeed";

interface PageProps {
  params: Promise<{ username: string }>;
}
const Page: React.FC<PageProps> = async ({ params }) => {
  const _params = await params;
  const username = sanitizedUsername(_params?.username);
  const profile = await getUserByUsername(username, ["id", "username"]);

  if (!profile?.id) {
    return null;
  }

  return (
    <main className="border rounded-bl-2xl rounded-br-2xl md:col-span-9 col-span-full mt-3">
      <UserArticleFeed userId={profile.id} />
    </main>
  );
};

export default Page;
