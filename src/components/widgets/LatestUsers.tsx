import Link from "next/link";
import * as userActions from "@/backend/services/user.action";
import { User } from "@/backend/models/domain-models";
import { getAvatarPlaceholder } from "@/lib/utils";
import Image from "next/image";
import getFileUrl from "@/utils/getFileUrl";
import { cookies } from "next/headers";
import bn from "@/i18n/bn.json";

async function translate(key: string): Promise<string> {
  const language = (await cookies()).get("language")?.value || "en";
  const dict = language === "bn" ? (bn as Record<string, string>) : null;
  return dict?.[key] ?? key;
}

const LatestUsers = async () => {
  const title = await translate("Latest registered users");

  let users: User[] = [];
  try {
    const usersResponse = await userActions.getUsers();
    users = (usersResponse?.nodes ?? []).filter(Boolean) as User[];
  } catch {
    users = [];
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-col gap-5">
        {users.map((user) => (
          <UserItem key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

export default LatestUsers;

const UserItem = ({ user }: { user: User }) => {
  const avatarSrc =
    getFileUrl(user.profile_photo) ||
    getAvatarPlaceholder(user.name ?? user.username ?? "");

  return (
    <div className="flex items-center">
      <Link href={`/@${user.username}`}>
        <div className="size-10 overflow-hidden rounded-full">
          <Image
            src={avatarSrc}
            alt={user.name ?? user.username}
            loading="lazy"
            unoptimized={!user.profile_photo}
            className="h-auto w-full"
            width={40}
            height={40}
          />
        </div>
      </Link>

      <div className="ml-2">
        <h3 className="text-dark text-base">
          <Link href={`/@${user.username}`} className="text-foreground">
            {user.name}
          </Link>
        </h3>
        <p className="text-muted-foreground text-xs">
          {new Date(user.created_at).toLocaleDateString("bn-BD", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};
