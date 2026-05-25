import { getSession } from "@/backend/services/session.actions";
import GistList from "@/components/Gist/GistList";

export default async function DashboardGistsPage() {
  const { user } = await getSession();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">My Gists</h3>
      <GistList userId={user?.id} showCreateButton />
    </div>
  );
}
