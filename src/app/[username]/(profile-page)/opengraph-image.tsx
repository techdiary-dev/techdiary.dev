import { getUserByUsername } from "@/backend/services/user.action";
import getFileUrl from "@/utils/getFileUrl";
import { sanitizedUsername } from "@/lib/utils";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const getFileLocation = async (relativePath: string) => {
  const fileData = await readFile(join(process.cwd(), "public", relativePath));
  return Uint8Array.from(fileData).buffer;
};

export default async function Image(options: ProfilePageProps) {
  const { username } = await options.params;
  const sanitized = sanitizedUsername(username);
  const profile = await getUserByUsername(sanitized, [
    "name",
    "username",
    "bio",
    "profile_photo",
    "designation",
  ]);

  const displayName = profile?.name ?? sanitized;
  const displayUsername = profile?.username ?? sanitized;
  const bio = profile?.bio ?? null;
  const designation = profile?.designation ?? null;
  const profilePhotoUrl = profile?.profile_photo
    ? getFileUrl(profile.profile_photo)
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          background: "white",
          fontFamily: "BANGLA_FONT",
          fontWeight: 400,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          width: "100%",
        }}
      >
        {/* Main content area */}
        <div
          style={{
            display: "flex",
            flex: 1,
            background: "rgb(54%, 61%, 100%)",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            gap: 40,
          }}
        >
          {/* Profile photo */}
          {profilePhotoUrl ? (
            <img
              src={profilePhotoUrl}
              alt={displayName}
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid white",
                flexShrink: 0,
              }}
            />
          ) : null}

          {/* Text info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              color: "white",
            }}
          >
            <h1
              style={{
                fontSize: 52,
                margin: 0,
                fontFamily: "BANGLA_FONT",
                lineHeight: 1.2,
              }}
            >
              {displayName}
            </h1>
            <p
              style={{
                fontSize: 28,
                margin: 0,
                opacity: 0.85,
              }}
            >
              @{displayUsername}
            </p>
            {designation ? (
              <p
                style={{
                  fontSize: 24,
                  margin: 0,
                  opacity: 0.8,
                }}
              >
                {designation}
              </p>
            ) : null}
            {bio ? (
              <p
                style={{
                  fontSize: 22,
                  margin: 0,
                  opacity: 0.75,
                  maxWidth: 600,
                  lineHeight: 1.4,
                }}
              >
                {bio.length > 120 ? bio.slice(0, 117) + "..." : bio}
              </p>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: 30,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <img
              style={{ height: 48 }}
              src={(await getFileLocation("logo-lg.png")) as any}
              alt="logo"
            />
            <p style={{ fontSize: 28 }}>Techdiary</p>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "BANGLA_FONT",
          data: await getFileLocation("fonts/HindSiliguri-Regular.ttf"),
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
