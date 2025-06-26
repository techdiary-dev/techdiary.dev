"use client";

import * as userActions from "@/backend/services/user.action";
import { useTranslation } from "@/i18n/use-translation";
import { useSession } from "@/store/session.atom";
import getFileUrl from "@/utils/getFileUrl";
import { useQuery } from "@tanstack/react-query";
import { VerifiedIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

interface Props {
  userId: string;
}

const UserInformationCard: React.FC<Props> = ({ userId }) => {
  const { _t } = useTranslation();
  const session = useSession();
  const query = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userActions.getUserById(userId),
  });

  if (query.isPending)
    return (
      <>
        <div className="h-45 relative flex flex-col gap-2">
          <div className="flex gap-4 items-center">
            <div className="size-[56px] bg-gray-200 dark:bg-gray-800 animate-pulse flex-none rounded-full" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 w-8/12 animate-pulse" />
            </div>
          </div>

          <div className="h-3 bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
      </>
    );

  return (
    <div>
      {/* Profile Header */}
      <div className="py-3 flex items-center">
        {/* Avatar */}
        {query.data?.profile_photo && (
          <div className="relative mr-4">
            <Image
              src={getFileUrl(query.data?.profile_photo) ?? ""}
              alt={query.data?.name ?? ""}
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover border-2 border-white/90 shadow-md"
            />
          </div>
        )}

        {/* Name */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">{query.data?.name}</h2>
            {query.data?.is_verified && (
              <VerifiedIcon className="size-5 fill-primary" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {query.data?.username}
          </p>
        </div>
      </div>

      {/* Profile Body */}
      <div className="space-y-4">
        {/* Edit Button */}
        {session?.user?.id == userId ? (
          <Button className="w-full" asChild>
            <Link href={"/dashboard/settings"}>{_t("Profile Settings")}</Link>
          </Button>
        ) : (
          <Button
            onClick={() => alert("Not implemented yet")}
            className="w-full"
          >
            {_t("Follow")}
          </Button>
        )}

        {/* Bio */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {query.data?.bio}
        </p>

        {/* Profile Details */}
        <div className="space-y-3">
          {/* Location */}
          {query.data?.location && (
            <div className="flex flex-col">
              <p className="font-semibold">{_t("Location")}</p>
              <p className="text-sm text-muted-foreground">
                {query.data?.location}
              </p>
            </div>
          )}

          {query.data?.education && (
            <div className="flex flex-col">
              <p className="font-semibold">{_t("Education")}</p>
              <p className="text-sm text-muted-foreground">
                {query.data?.education}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInformationCard;
