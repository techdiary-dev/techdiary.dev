import {
  boolean,
  integer,
  json,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { IServerFile } from "../models/domain-models";

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  username: varchar("username").notNull(),
  is_verified: boolean("is_verified").default(false),
  email: varchar("email"),
  profile_photo_url: varchar("profile_photo_url"),
  profile_photo: json("profile_photo").$type<IServerFile>(),
  education: varchar("education"),
  designation: varchar("designation"),
  bio: varchar("bio"),
  websiteUrl: varchar("website_url"),
  location: varchar("location"),
  social_links: json("social_links"),
  profile_readme: text("profile_readme"),
  skills: varchar("skills"),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const userSocialsTable = pgTable("user_socials", {
  id: uuid("id").defaultRandom().primaryKey(),
  service: varchar("service").notNull(),
  service_uid: varchar("service_uid").notNull(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const userSessionsTable = pgTable("user_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: varchar("token").notNull(),
  device: varchar("device"), // os + browser
  ip: varchar("ip"),
  last_action_at: timestamp("last_action_at"),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const userFollowsTable = pgTable("user_follows", {
  id: uuid("id").defaultRandom().primaryKey(),
  follower_id: uuid("follower_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  followee_id: uuid("followee_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const seriesTable = pgTable("series", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title").notNull(),
  handle: varchar("handle"),
  cover_image: jsonb("cover_image").$type<IServerFile>(),
  owner_id: uuid("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const seriesItemsTable = pgTable("series_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  series_id: uuid("series_id")
    .notNull()
    .references(() => seriesTable.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // title, article
  title: varchar("title"),
  article_id: uuid("article_id").references(() => articlesTable.id, {
    onDelete: "cascade",
  }),
  index: integer("index").notNull().default(0),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const articlesTable = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title").notNull(),
  handle: varchar("handle").notNull(),
  excerpt: varchar("excerpt"),
  body: text("body"),
  cover_image: jsonb("cover_image").$type<IServerFile>(),
  published_at: timestamp("published_at"),
  approved_at: timestamp("approved_at"),
  delete_scheduled_at: timestamp("delete_scheduled_at"),
  metadata: jsonb("metadata"),
  author_id: uuid("author_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const bookmarksTable = pgTable("bookmarks", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  resource_id: uuid("resource_id").notNull(),
  resource_type: varchar("resource_type", { length: 50 }).notNull(), // ARTICLE, COMMENT
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

// [ { reaction_type: 'LOVE', count: 0, is_reacted: true } ]

export const reactionsTable = pgTable("reactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  resource_id: uuid("resource_id").notNull(),
  resource_type: varchar("resource_type", { length: 50 }).notNull(), // ARTICLE, COMMENT
  reaction_type: varchar("reaction_type", { length: 50 }).notNull(), // LIKE, DISLIKE, LOVE, etc.
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const commentsTable = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  body: text("body").notNull(),
  resource_id: uuid("resource_id").notNull(), // article_id or series_item_id
  resource_type: varchar("resource_type", { length: 50 }).notNull(), // ARTICLE, SERIES_ITEM
  user_id: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  icon: jsonb("icon").$type<IServerFile>(),
  color: varchar("color", { length: 6 }),
  description: text("description"),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const articleTagsTable = pgTable("article_tag", {
  id: uuid("id").defaultRandom().primaryKey(),
  article_id: uuid("article_id")
    .notNull()
    .references(() => articlesTable.id, { onDelete: "cascade" }),
  tag_id: uuid("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),

  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const KVTable = pgTable("kv", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
});
