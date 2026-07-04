import { pgTable, text, integer, boolean, timestamp, primaryKey, index, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users Table
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    username: text("username").notNull().unique(),
    displayName: text("display_name"),
    avatar: text("avatar"),
    bio: text("bio"),
    website: text("website"),
    twitter: text("twitter"),
    github: text("github"),
    followersCount: integer("followers_count").default(0).notNull(),
    followingCount: integer("following_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("username_idx").on(table.username),
  ]
);

// Writings (Posts) Table
export const writings = pgTable(
  "writings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    content: text("content").notNull(), // HTML rich text from TipTap
    primaryEmotion: text("primary_emotion").notNull(),
    secondaryEmotion: text("secondary_emotion"),
    language: text("language").default("en").notNull(),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(), // stored as JSON array e.g. ["#poem", "#love"]
    coverImage: text("cover_image"),
    readingTime: integer("reading_time").default(0).notNull(), // in minutes
    views: integer("views").default(0).notNull(),
    isDraft: boolean("is_draft").default(false).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("slug_idx").on(table.slug),
    index("user_id_idx").on(table.userId),
    index("primary_emotion_idx").on(table.primaryEmotion),
    index("views_idx").on(table.views),
    index("published_at_idx").on(table.publishedAt),
  ]
);

// Reactions Table
export const reactions = pgTable(
  "reactions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    writingId: text("writing_id")
      .notNull()
      .references(() => writings.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'felt_this', 'inspired', 'powerful', 'beautiful', 'relatable', 'thoughtful'
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("writing_reactions_idx").on(table.writingId),
    index("user_reactions_idx").on(table.userId, table.writingId),
  ]
);

// Bookmarks Table
export const bookmarks = pgTable(
  "bookmarks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    writingId: text("writing_id")
      .notNull()
      .references(() => writings.id, { onDelete: "cascade" }),
    folderName: text("folder_name").default("All").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("user_bookmarks_idx").on(table.userId),
    index("bookmark_folder_idx").on(table.userId, table.folderName),
  ]
);

// Comments Table
export const comments = pgTable(
  "comments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    writingId: text("writing_id")
      .notNull()
      .references(() => writings.id, { onDelete: "cascade" }),
    parentId: text("parent_id"), // self-reference for nested replies
    content: text("content").notNull(), // Plain / markdown text
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("writing_comments_idx").on(table.writingId),
    index("parent_comments_idx").on(table.parentId),
  ]
);

// Follows Table (Composite Primary Key)
export const follows = pgTable(
  "follows",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.followerId, table.followingId] }),
    index("follower_idx").on(table.followerId),
    index("following_idx").on(table.followingId),
  ]
);

// Notifications Table
export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    recipientId: text("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    actorId: text("actor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'follow', 'comment', 'mention', 'reply', 'reaction', 'bookmark_milestone'
    writingId: text("writing_id").references(() => writings.id, { onDelete: "cascade" }),
    commentId: text("comment_id").references(() => comments.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("recipient_idx").on(table.recipientId),
    index("recipient_unread_idx").on(table.recipientId, table.readAt),
  ]
);

// Relations Setup
export const usersRelations = relations(users, ({ many }) => ({
  writings: many(writings),
  reactions: many(reactions),
  bookmarks: many(bookmarks),
  comments: many(comments),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "followers" }),
  notificationsReceived: many(notifications, { relationName: "recipient" }),
  notificationsActed: many(notifications, { relationName: "actor" }),
  reviews: many(reviews),
}));

export const writingsRelations = relations(writings, ({ one, many }) => ({
  user: one(users, {
    fields: [writings.userId],
    references: [users.id],
  }),
  reactions: many(reactions),
  bookmarks: many(bookmarks),
  comments: many(comments),
  reviews: many(reviews),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
  writing: one(writings, {
    fields: [reactions.writingId],
    references: [writings.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  writing: one(writings, {
    fields: [bookmarks.writingId],
    references: [writings.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  writing: one(writings, {
    fields: [comments.writingId],
    references: [writings.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "replies",
  }),
  replies: many(comments, {
    relationName: "replies",
  }),
  commentLikes: many(commentLikes),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "followers",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.id],
    relationName: "recipient",
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
    relationName: "actor",
  }),
  writing: one(writings, {
    fields: [notifications.writingId],
    references: [writings.id],
  }),
  comment: one(comments, {
    fields: [notifications.commentId],
    references: [comments.id],
  }),
}));

export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    writingId: text("writing_id")
      .notNull()
      .references(() => writings.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    content: text("content"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("writing_reviews_idx").on(table.writingId),
    index("user_reviews_idx").on(table.userId, table.writingId),
  ]
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  writing: one(writings, {
    fields: [reviews.writingId],
    references: [writings.id],
  }),
}));

export const commentLikes = pgTable(
  "comment_likes",
  {
    id: text("id").primaryKey(),
    commentId: text("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("comment_likes_idx").on(table.commentId),
    index("user_comment_likes_idx").on(table.userId, table.commentId),
  ]
);

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(comments, {
    fields: [commentLikes.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentLikes.userId],
    references: [users.id],
  }),
}));
