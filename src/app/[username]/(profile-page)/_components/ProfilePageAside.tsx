import { User } from "@/backend/models/domain-models";
import Behance from "@/components/icons/behance";
import Dribbble from "@/components/icons/Dribbble";
import Facebook from "@/components/icons/facebook";
import Github from "@/components/icons/github";
import Instagram from "@/components/icons/instagram";
import Linkinedin from "@/components/icons/linkinedin";
import Medium from "@/components/icons/medium";
import Stackoverflow from "@/components/icons/stackoverflow";
import Twitch from "@/components/icons/twitch";
import X from "@/components/icons/x";
import Youtube from "@/components/icons/youtube";
import getFileUrl from "@/utils/getFileUrl";
import { Link2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ProfilePageAsideProps {
  profile: User | null;
}

const ProfilePageAside: React.FC<ProfilePageAsideProps> = ({ profile }) => {
  return (
    <div>
      <Image
        className="w-[28%] md:w-full rounded"
        width={320}
        height={320}
        src={
          getFileUrl(profile?.profile_photo) ||
          `https://api.dicebear.com/8.x/initials/svg?seed=${profile?.username}`
        }
        alt={profile?.username ?? "Profile photo"}
      />
      <div className="mt-4">
        <h2 className="text-xl font-semibold">{profile?.name}</h2>
        <p className="lowercase text-muted-foreground">@{profile?.username}</p>
      </div>

      {profile?.designation && (
        <p className="my-2 text-base">{profile?.designation}</p>
      )}

      {profile?.bio && (
        <p className="my-2 text-sm text-muted-foreground">{profile?.bio}</p>
      )}

      {/* User infos start */}
      <div className="flex flex-col mt-4 gap-2 md:gap-4">
        {profile?.website_url && (
          <div className="flex items-center space-x-1">
            <Link2Icon className="w-5 h-5" />
            <a
              target="_blank"
              href={profile?.website_url}
              className="text-sm text-dark hover:underline"
            >
              {profile?.website_url}
            </a>
          </div>
        )}

        {profile?.education && (
          <div className="flex items-center space-x-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            <span className="text-sm">{profile?.education}</span>
          </div>
        )}

        {profile?.email && (
          <div className="flex items-center space-x-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">{profile?.email}</span>
          </div>
        )}

        {profile?.location && (
          <div className="flex items-center space-x-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">{profile?.location}</span>
          </div>
        )}
      </div>
      {/* User infos end */}

      {/* Uer Socials start */}
      <div className="flex flex-wrap gap-3 mt-5">
        {profile?.social_links?.github && (
          <Link
            href={profile?.social_links?.github}
            target="_blank"
            className=" text-forground-muted"
          >
            <Github size={30} />
          </Link>
        )}

        {profile?.social_links?.facebook && (
          <Link
            href={profile?.social_links?.facebook}
            target="_blank"
            className=" text-forground-muted"
          >
            <Facebook size={30} />
          </Link>
        )}

        {/* {profile?.social_links?.stackOverflow && (
          <Link
            href={profile?.social_links?.stackOverflow}
            target="_blank"
            className=" text-forground-muted"
          >
            <Stackoverflow size={30} />
          </Link>
        )}

        {profile?.social_links?.medium && (
          <Link
            href={profile?.social_links?.medium}
            target="_blank"
            className=" text-forground-muted"
          >
            <Medium size={30} />
          </Link>
        )} */}

        {profile?.social_links?.linkedin && (
          <a
            href={profile?.social_links?.linkedin}
            target="_blank"
            className=" text-forground-muted"
          >
            <Linkinedin size={30} />
          </a>
        )}

        {profile?.social_links?.x && (
          <Link
            href={profile?.social_links?.x}
            target="_blank"
            className=" text-forground-muted"
          >
            <X size={30} />
          </Link>
        )}

        {profile?.social_links?.instagram && (
          <Link
            href={profile?.social_links?.instagram}
            target="_blank"
            className=" text-forground-muted"
          >
            <Instagram size={30} />
          </Link>
        )}

        {/* {profile?.social_links?.behance && (
          <a
            href={profile?.social_links?.behance}
            target="_blank"
            className=" text-forground-muted"
          >
            <Behance size={30} />
          </a>
        )}

        {profile?.social_links?.dribbble && (
          <Link
            href={profile?.social_links?.dribbble}
            target="_blank"
            className=" text-forground-muted"
          >
            <Dribbble size={30} />
          </Link>
        )}

        {profile?.social_links?.twitch && (
          <Link
            href={profile?.social_links?.twitch}
            target="_blank"
            className=" text-forground-muted"
          >
            <Twitch size={30} />
          </Link>
        )} */}

        {profile?.social_links?.youtube && (
          <a
            href={profile?.social_links?.youtube}
            target="_blank"
            className=" text-forground-muted"
          >
            <Youtube size={30} />
          </a>
        )}
      </div>
      {/* User Socials end */}
    </div>
  );
};

export default ProfilePageAside;
