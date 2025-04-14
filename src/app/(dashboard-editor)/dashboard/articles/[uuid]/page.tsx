import { Article, ArticleTag, Tag, User } from "@/backend/models/domain-models";
import { persistenceRepository } from "@/backend/persistence-repositories";
import { DatabaseTableName } from "@/backend/persistence/persistence-contracts";
import {
  and,
  eq,
  inArray,
  leftJoin,
} from "@/backend/persistence/persistence-where-operator";
import * as sessionActions from "@/backend/services/session.actions";
import ArticleEditor from "@/components/Editor/ArticleEditor";
import { notFound } from "next/navigation";
import React from "react";

interface Props {
  params: Promise<{ uuid: string }>;
}
const page: React.FC<Props> = async ({ params }) => {
  const sessionUserId = await sessionActions.getSessionUserId();
  const _params = await params;
  // eq("author_id", sessionUserId)
  const [article] = await persistenceRepository.article.findRows({
    limit: 1,
    where: and(eq("id", _params.uuid), eq("author_id", sessionUserId)),
    joins: [
      leftJoin<Article, User>({
        as: "author",
        joinTo: DatabaseTableName.users,
        localField: "author_id",
        foreignField: "id",
        columns: ["id", "name", "username"],
      }),
    ],
  });

  const aggregatedTags = await persistenceRepository.articleTag.findRows({
    where: inArray("article_id", [article.id]),
    joins: [
      leftJoin<ArticleTag, Tag>({
        as: "tag",
        joinTo: "tags",
        localField: "tag_id",
        foreignField: "id",
        columns: ["id", "name", "color", "icon", "description"],
      }),
    ],
  });

  const tags = aggregatedTags?.map((item) => item?.tag);
  if (tags.length) {
    article.tags = tags as Tag[];
  }

  if (!article) {
    throw notFound();
  }

  return <ArticleEditor uuid={_params.uuid} article={article} />;
};

export default page;
