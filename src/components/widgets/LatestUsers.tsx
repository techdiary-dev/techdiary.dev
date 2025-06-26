import _t from "@/i18n/_t";
import Link from "next/link";
import * as userActions from "@/backend/services/user.action";
import { User } from "@/backend/models/domain-models";
import Image from "next/image";
import getFileUrl from "@/utils/getFileUrl";

const LatestUsers = async () => {
  const usersResponse = await userActions.getUsers();

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
        {_t("Latest registered users")}
      </h3>
      <div className="flex flex-col gap-5">
        {/* {isFetching &&
          Array.from({ length: 10 }).map((_, i) => <UserSkeleton key={i} />)} */}

        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
        {usersResponse?.nodes.map((user) => (
          <UserItem key={user.id} user={user!} />
        ))}
      </div>
    </div>
  );
};

export default LatestUsers;

const UserItem = ({ user }: { user: User }) => (
  <div className="flex items-center">
    {user?.profile_photo && (
      <Link href={`/@${user.username}`}>
        <div className="size-10 overflow-hidden rounded-full">
          <Image
            src={getFileUrl(user?.profile_photo)!}
            alt={user?.name!}
            loading="lazy"
            className="h-auto w-full"
            width={40}
            height={40}
          />
        </div>
      </Link>
    )}

    <div className="ml-2">
      <h3 className="text-dark text-base">
        <Link href={`/@${user?.username}`} className="text-foreground">
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
