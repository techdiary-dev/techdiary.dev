import { Tag } from "@/backend/models/domain-models";
import { DatabaseTableName } from "@/backend/persistence/persistence-contracts";
import { persistenceRepository } from "@/backend/persistence/persistence-repositories";
import * as sessionActions from "@/backend/services/session.actions";
import ArticleEditor from "@/components/Editor/ArticleEditor";
import { notFound } from "next/navigation";
import React from "react";
import { and, eq, inArray } from "sqlkit";

interface Props {
  params: Promise<{ uuid: string }>;
}
const page: React.FC<Props> = async ({ params }) => {
  const sessionUserId = await sessionActions.authID();

  const _params = await params;

  const [article] = await persistenceRepository.article.find({
    limit: 1,
    where: and(eq("id", _params.uuid), eq("author_id", sessionUserId!)),
    joins: [
      {
        as: "author",
        table: DatabaseTableName.users,
        type: "left",
        on: {
          localField: "author_id",
          foreignField: "id",
        },
        columns: ["id", "name", "username"],
      },
    ],
  });

  const aggregatedTags = await persistenceRepository.articleTagPivot.find({
    where: inArray("article_id", [article.id]),
    joins: [
      {
        as: "tag",
        table: "tags",
        type: "left",
        on: {
          localField: "tag_id",
          foreignField: "id",
        },
        columns: ["id", "name", "color", "icon", "description"],
      },
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
