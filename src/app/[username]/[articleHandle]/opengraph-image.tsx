import { persistenceRepository } from "@/backend/persistence/persistence-repositories";
import getFileUrl from "@/utils/getFileUrl";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { eq } from "sqlkit";

interface ArticlePageProps {
  params: Promise<{
    username: string;
    articleHandle: string;
  }>;
}

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const getFileLocation = async (path: string) => {
  const logoData = await readFile(join(process.cwd(), path));
  return Uint8Array.from(logoData).buffer;
};

export default async function Image(options: ArticlePageProps) {
  const { articleHandle } = await options.params;
  const [article] = await persistenceRepository.article.find({
    where: eq("handle", articleHandle),
    columns: ["title", "excerpt", "cover_image", "body"],
    limit: 1,
    joins: [
      {
        as: "user",
        table: "users",
        type: "left",
        on: {
          localField: "author_id",
          foreignField: "id",
        },
        columns: ["username", "profile_photo"],
      },
    ],
  });

  return new ImageResponse(
    (
      <div
        style={{
          background: "white",
          fontFamily: "KohinoorBangla",
          fontWeight: 400,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            textAlign: "center",
            background: "rgb(54%, 61%, 100%)",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <h2
            style={{
              fontSize: 45,
              padding: 30,
              color: "white",
            }}
          >
            {article.title}
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 30,
          }}
        >
          {/* User profile */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <img
              style={{ height: 48, borderRadius: 100 }}
              src={getFileUrl(article.user?.profile_photo) ?? ""}
              alt="logo"
            />
            <p style={{ fontSize: 23 }}>
              @{article.user?.username ?? "Unknown user"}
            </p>
          </div>

          {/* Logo */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <img
              style={{ height: 48 }}
              src={(await getFileLocation("/public/logo-lg.png")) as any}
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
          name: "KohinoorBangla",
          data: await getFileLocation(
            "/public/fonts/KohinoorBangla-Regular.woff"
          ),
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
