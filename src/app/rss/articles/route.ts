import type { Article, User } from "@/backend/models/domain-models";
import { persistenceRepository } from "@/backend/persistence/persistence-repositories";
import { DatabaseTableName } from "@/backend/persistence/persistence-contracts";
import { markdocToHtmlForRss } from "@/lib/markdown/markdoc-html-string";
import getFileUrl from "@/utils/getFileUrl";
import * as sk from "sqlkit";
import { and, desc, neq } from "sqlkit";

const RSS_ITEM_LIMIT = 100;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822Date(d: Date): string {
  return d.toUTCString();
}

export async function GET(request: Request) {
  const feedUrl = new URL(request.url);
  const siteUrl = feedUrl.origin;

  const { nodes } = await persistenceRepository.article.paginate({
    where: and(neq("published_at", null), neq("approved_at", null)),
    page: 1,
    limit: RSS_ITEM_LIMIT,
    orderBy: [desc("published_at")],
    columns: [
      "id",
      "title",
      "handle",
      "body",
      "cover_image",
      "published_at",
      "created_at",
      "updated_at",
    ],
    joins: [
      {
        as: "user",
        table: DatabaseTableName.users,
        type: "left",
        on: {
          foreignField: "id",
          localField: "author_id",
        },
        columns: ["id", "name", "username"],
      } as sk.Join<Article, User>,
    ],
  });

  const articles = nodes.filter((a) => a.handle && a.user?.username);
  const now = new Date();

  const channelItems = articles
    .map((article) => {
      const username = article.user!.username!;
      const href = `${siteUrl}/@${username}/${article.handle}`;
      const pub = article.published_at ?? article.created_at ?? now;

      const author =
        article.user?.name?.trim() || (username ? `@${username}` : "TechDiary");

      const coverSrc = article.cover_image
        ? getFileUrl(article.cover_image).trim()
        : "";
      const mediaThumb =
        coverSrc !== ""
          ? `\n      <media:thumbnail url="${escapeXml(coverSrc)}" />`
          : "";

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(href)}</link>
      <guid isPermaLink="true">${escapeXml(href)}</guid>
      <pubDate>${rfc822Date(pub)}</pubDate>
      <dc:creator>${escapeXml(author)}</dc:creator>${mediaThumb}
      <description><![CDATA[${markdocToHtmlForRss(article.body, {
        featureImageUrl: coverSrc || undefined,
        featureImageAlt: article.title,
      })}]]></description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>TechDiary — Articles</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>Latest published articles on TechDiary</description>
    <language>bn-bd</language>
    <lastBuildDate>${rfc822Date(now)}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl.href)}" rel="self" type="application/rss+xml"/>
${channelItems}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
