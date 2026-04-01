import { eq } from "sqlkit";
import { persistenceRepository } from "../persistence/persistence-repositories";

/** Walks parent COMMENT chain to the root ARTICLE or GIST for notification payloads and links. */
export async function commentThreadRootResource(commentId: string): Promise<
  | {
      kind: "ARTICLE";
      article_id: string;
      article_handle: string;
      article_title: string;
      article_author_username?: string;
    }
  | { kind: "GIST"; gist_id: string; gist_title: string }
  | null
> {
  let currentId: string | undefined = commentId;
  for (let depth = 0; depth < 50 && currentId; depth++) {
    const [row] = await persistenceRepository.comment.find({
      where: eq("id", currentId),
      limit: 1,
      columns: ["resource_id", "resource_type"],
    });
    if (!row) return null;
    const { resource_id, resource_type } = row;
    if (resource_type === "ARTICLE") {
      const [article] = await persistenceRepository.article.find({
        where: eq("id", resource_id),
        limit: 1,
        columns: ["id", "author_id", "title", "handle"],
      });
      if (!article) return null;
      const [articleAuthor] = await persistenceRepository.user.find({
        where: eq("id", article.author_id),
        limit: 1,
        columns: ["username"],
      });
      return {
        kind: "ARTICLE",
        article_id: article.id,
        article_handle: article.handle,
        article_title: article.title,
        ...(articleAuthor?.username
          ? { article_author_username: articleAuthor.username }
          : {}),
      };
    }
    if (resource_type === "GIST") {
      const [gist] = await persistenceRepository.gist.find({
        where: eq("id", resource_id),
        limit: 1,
        columns: ["id", "title"],
      });
      if (!gist) return null;
      return {
        kind: "GIST",
        gist_id: gist.id,
        gist_title: gist.title,
      };
    }
    if (resource_type === "COMMENT") {
      currentId = resource_id;
      continue;
    }
    return null;
  }
  return null;
}
