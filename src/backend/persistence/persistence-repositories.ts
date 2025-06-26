import { Repository } from "sqlkit";
import {
  Article,
  ArticleTag,
  Bookmark,
  Reaction,
  Series,
  SeriesItem,
  Tag,
  User,
  UserSession,
  Comment,
  UserSocial,
  KV,
} from "../models/domain-models";
import { pgClient } from "./clients";
import { DatabaseTableName } from "./persistence-contracts";

const repositoryConfig = { logging: false };

const userRepository = new Repository<User>(
  DatabaseTableName.users,
  pgClient,
  repositoryConfig
);
const articleRepository = new Repository<Article>(
  DatabaseTableName.articles,
  pgClient,
  { logging: true }
);
const tagRepository = new Repository<Tag>(
  DatabaseTableName.tags,
  pgClient,
  repositoryConfig
);
const articleTagRepository = new Repository<ArticleTag>(
  DatabaseTableName.article_tag,
  pgClient,
  repositoryConfig
);
const userSocialRepository = new Repository<UserSocial>(
  DatabaseTableName.user_socials,
  pgClient,
  repositoryConfig
);
const userSessionRepository = new Repository<UserSession>(
  DatabaseTableName.user_sessions,
  pgClient,
  repositoryConfig
);

const seriesRepository = new Repository<Series>(
  DatabaseTableName.series,
  pgClient,
  repositoryConfig
);

const seriesItemsRepository = new Repository<SeriesItem>(
  DatabaseTableName.series_items,
  pgClient,
  repositoryConfig
);

const bookmarkRepository = new Repository<Bookmark>(
  DatabaseTableName.bookmarks,
  pgClient,
  repositoryConfig
);

const reactionRepository = new Repository<Reaction>(
  DatabaseTableName.reactions,
  pgClient,
  repositoryConfig
);

const commentRepository = new Repository<Comment>(
  DatabaseTableName.comments,
  pgClient,
  repositoryConfig
);

const kvRepository = new Repository<KV>(DatabaseTableName.kv, pgClient, {
  logging: true,
});

export const persistenceRepository = {
  user: userRepository,
  userSocial: userSocialRepository,
  userSession: userSessionRepository,
  article: articleRepository,
  bookmark: bookmarkRepository,
  comment: commentRepository,
  reaction: reactionRepository,
  articleTagPivot: articleTagRepository,
  tags: tagRepository,
  series: seriesRepository,
  seriesItems: seriesItemsRepository,
  kv: kvRepository,
};
