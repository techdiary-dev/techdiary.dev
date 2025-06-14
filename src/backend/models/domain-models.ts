export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  profile_photo: string;
  education: string;
  designation: string;
  bio: string;
  website_url: string;
  location: string;
  social_links: {
    github?: string;
    x?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  profile_readme: string;
  skills: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserSocial {
  id: number;
  service: string;
  service_uid: string;

  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  token: string;
  device?: string;
  device_type?: string;
  ip?: string;
  last_action_at?: Date;
  created_at: Date;
}

export interface IServerFile {
  key: string;
  provider: "cloudinary" | "direct";
}

export interface ArticleMetadata {
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    canonical_url?: string;
  } | null;
}

export interface Article {
  id: string;
  title: string;
  handle: string;
  tags?: Tag[];
  excerpt?: string | null;
  body?: string | null;
  cover_image?: IServerFile | null;
  is_published: boolean;
  published_at?: Date | null;
  approved_at?: Date | null;
  user?: User | null;
  metadata?: ArticleMetadata | null;
  author_id: string;
  delete_scheduled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Series {
  id: string;
  title: string;
  handle: string;
  cover_image?: IServerFile | null;
  owner_id: string;
  owner?: User | null;
  created_at: Date;
  updated_at: Date;
}

export interface SeriesItem {
  id: string;
  series_id: string;
  type: "TITLE" | "ARTICLE";
  title?: string | null;
  article_id?: string | null;
  article?: Article | null;
  index: number;
  created_at: Date;
  updated_at: Date;
}

export interface Tag {
  id: string;
  name: string;
  icon?: IServerFile | null;
  color?: string | null;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ArticleTag {
  id: string;
  article_id: string;
  tag_id: string;
  created_at: Date;
  updated_at: Date;

  // Relationships
  article?: Article;
  tag?: Tag;
}

export interface Bookmark {
  id: string;
  resource_id: string;
  resource_type: "ARTICLE" | "COMMENT";
  user_id: string;
  created_at: Date;
}

export interface Comment {
  id: string;
  resource_id: string;
  resource_type: "ARTICLE" | "COMMENT";
  body?: string;
  user_id: string;
  created_at: Date;
}

export interface CommentPresentation {
  id: string;
  body?: string;
  level?: number;
  created_at?: Date;
  author?: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
  replies?: CommentPresentation[];
}

export type REACTION_TYPE =
  | "LOVE"
  | "UNICORN"
  | "WOW"
  | "FIRE"
  | "CRY"
  | "HAHA";

export enum DIRECTORY_NAME {
  ARTICLE_COVER = "article-cover",
  ARTICLE_CONTENT = "article-content",
  USER_PROFILE = "user-profile",
  USER_PROFILE_README_CONTENT = "user-profile-readme-content",
  COMMENT_ATTACHMENT = "comment-attachment",
}

export interface Reaction {
  resource_id: string;
  resource_type: "ARTICLE" | "COMMENT";
  reaction_type: REACTION_TYPE;
  user_id: string;
  created_at: Date;
}

export interface ReactionStatus {
  count: number;
  is_reacted: boolean;
  reaction_type?: REACTION_TYPE;
  reactor_user_ids?: string[];
}
