import { getUserByUsername } from "@/backend/services/user.action";
import { sanitizedUsername } from "@/lib/utils";
import GistList from "@/components/Gist/GistList";

interface PageProps {
  params: Promise<{ username: string }>;
}

const Page = async ({ params }: PageProps) => {
  const _params = await params;
  const username = sanitizedUsername(_params?.username);
  const profile = await getUserByUsername(username, ["id", "username"]);

  return (
    <main className="border rounded-bl-2xl rounded-br-2xl md:col-span-9 col-span-full mt-3">
      <GistList userId={profile?.id} isPublic={true} showCreateButton={false} />
    </main>
  );
};

export default Page;
