import { IServerFile } from "./AppImage.model";
import { UserReference } from "./User.model";

export interface IArticleFeedItem {
  id: string;
  title: string;
  slug: string;
  url: string;
  votes: Votes;
  bookmarked_users: string[];
  comments_count: number;
  thumbnail: string;
  tags: Tag[];
  excerpt: null;
  user: UserReference;
  body: {
    html?: string;
    markdown?: string;
    plainText?: string;
    excerpt?: string;
  };
  created_at: Date;
  published_at: Date;
}

export interface IBookmarkArticle {
  id: string;
  title: string;
  slug: string;
  user: UserReference;
}

export interface IArticleDetail {
  id: string;
  title: string;
  slug: string;
  url: string;
  thumbnail?: IServerFile;
  body: {
    html?: string;
    markdown?: string;
    plainText?: string;
    excerpt?: string;
  };
  votes: Votes;
  bookmarked_users: string[];
  comments_count: null;
  excerpt: null;
  is_approved: boolean;
  tags: any[];
  user: UserReference;
  seo: null;
  settings: null;
  created_at: Date;
  updated_at: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: null;
  description: null;
}

export interface Votes {
  up_voters: string[];
  down_voters: string[];
  score: number;
}
