import { Hono } from "hono";
import { handle } from "hono/vercel";
import { db } from "@/db";
import { users, writings, reactions, bookmarks, comments, follows, notifications, reviews, commentLikes } from "@/db/schema";
import { eq, and, desc, sql, inArray, lt, or } from "drizzle-orm";
import { hexclaveServerApp } from "@/hexclave/server";
import { z } from "zod";
import { seedWritings as rawSeedWritings, quotes as rawQuotes, authors as rawAuthors } from "@/lib/seed-data";

const app = new Hono().basePath("/api/v1");

// Helper to get authenticated Hexclave user
async function getAuthUser(c: any) {
  try {
    const user = await hexclaveServerApp.getUser({ tokenStore: c.req.raw });
    return user;
  } catch (e) {
    return null;
  }
}

// Helper to sync and return the local DB user
async function getOrCreateDbUser(c: any) {
  const hexclaveUser = await getAuthUser(c);
  if (!hexclaveUser) return null;

  const [existing] = await db.select().from(users).where(eq(users.id, hexclaveUser.id));
  if (existing) return existing;

  const emailUsername = hexclaveUser.primaryEmail?.split("@")[0] || "user";
  const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
  const username = ((hexclaveUser as any).username || `${emailUsername}_${uniqueSuffix}`)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");

  const [newUser] = await db.insert(users).values({
    id: hexclaveUser.id,
    username: username,
    displayName: hexclaveUser.displayName || username,
    avatar: (hexclaveUser as any).avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
    bio: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  .onConflictDoUpdate({
    target: users.id,
    set: {
      updatedAt: new Date(),
    }
  })
  .returning();

  return newUser;
}

// Helper to generate unique slugs
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  
  let slug = baseSlug || "untitled";
  let count = 0;
  
  while (true) {
    const currentSlug = count === 0 ? slug : `${slug}-${count}`;
    const [existing] = await db.select().from(writings).where(eq(writings.slug, currentSlug));
    if (!existing) {
      return currentSlug;
    }
    count++;
  }
}

// ----------------------------------------------------
// Writings Routes
// ----------------------------------------------------

// Random writings
app.get("/writings/random", async (c) => {
  const list = await db
    .select({
      id: writings.id,
      title: writings.title,
      slug: writings.slug,
      primaryEmotion: writings.primaryEmotion,
    })
    .from(writings)
    .where(eq(writings.isDraft, false))
    .limit(100);

  const shuffled = list.sort(() => 0.5 - Math.random()).slice(0, 3);
  return c.json({ data: shuffled });
});

// List writings (Feed)
app.get("/writings", async (c) => {
  const emotion = c.req.query("emotion");
  const tag = c.req.query("tag");
  const lang = c.req.query("language");
  const query = c.req.query("query");
  const feedType = c.req.query("feedType") || "latest"; // latest, trending, following, for-you
  const limit = parseInt(c.req.query("limit") || "10");
  const offset = parseInt(c.req.query("offset") || "0");

  const dbUser = await getOrCreateDbUser(c);

  let conditions: any[] = [eq(writings.isDraft, false)];

  if (emotion) {
    conditions.push(eq(writings.primaryEmotion, emotion));
  }
  if (tag) {
    conditions.push(sql`${writings.tags}::jsonb @> ${JSON.stringify([tag])}::jsonb`);
  }
  if (lang) {
    conditions.push(eq(writings.language, lang));
  }
  if (query) {
    conditions.push(
      or(
        sql`lower(${writings.title}) like ${`%${query.toLowerCase()}%`}`,
        sql`lower(${writings.content}) like ${`%${query.toLowerCase()}%`}`
      )
    );
  }

  // Handle Following Feed
  if (feedType === "following" && dbUser) {
    const userFollows = await db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.followerId, dbUser.id));
    const ids = userFollows.map((f) => f.followingId);
    if (ids.length > 0) {
      conditions.push(inArray(writings.userId, ids));
    } else {
      return c.json({ data: [] });
    }
  }

  let queryBuilder = db
    .select({
      writing: writings,
      author: users,
    })
    .from(writings)
    .innerJoin(users, eq(writings.userId, users.id))
    .where(and(...conditions));

  let orderedQuery;
  if (feedType === "trending") {
    orderedQuery = queryBuilder.orderBy(desc(writings.views), desc(writings.createdAt));
  } else {
    orderedQuery = queryBuilder.orderBy(desc(writings.createdAt));
  }

  const results = await orderedQuery.limit(limit).offset(offset);

  // Enhance with reactions & bookmarks for current user
  const enhanced = await Promise.all(
    results.map(async (item) => {
      const [userReaction] = dbUser
        ? await db
            .select()
            .from(reactions)
            .where(and(eq(reactions.userId, dbUser.id), eq(reactions.writingId, item.writing.id)))
        : [];
      
      const [userBookmark] = dbUser
        ? await db
            .select()
            .from(bookmarks)
            .where(and(eq(bookmarks.userId, dbUser.id), eq(bookmarks.writingId, item.writing.id)))
        : [];

      const reactionCounts = await db
        .select({
          count: sql<number>`count(*)`,
          type: reactions.type,
        })
        .from(reactions)
        .where(eq(reactions.writingId, item.writing.id))
        .groupBy(reactions.type);

      return {
        ...item.writing,
        author: item.author,
        userReaction: userReaction?.type || null,
        isBookmarked: !!userBookmark,
        bookmarkFolder: userBookmark?.folderName || null,
        reactions: reactionCounts.reduce((acc, curr) => {
          acc[curr.type] = Number(curr.count);
          return acc;
        }, {} as Record<string, number>),
      };
    })
  );

  return c.json({ data: enhanced });
});

// Get single writing by slug
app.get("/writings/:slug", async (c) => {
  const slug = c.req.param("slug");
  const dbUser = await getOrCreateDbUser(c);

  const [result] = await db
    .select({
      writing: writings,
      author: users,
    })
    .from(writings)
    .innerJoin(users, eq(writings.userId, users.id))
    .where(or(eq(writings.slug, slug), eq(writings.id, slug)));

  if (!result) {
    return c.json({ error: "Writing not found" }, 404);
  }

  // Increment views
  await db
    .update(writings)
    .set({ views: result.writing.views + 1 })
    .where(eq(writings.id, result.writing.id));

  // Get user interaction
  const [userReaction] = dbUser
    ? await db
        .select()
        .from(reactions)
        .where(and(eq(reactions.userId, dbUser.id), eq(reactions.writingId, result.writing.id)))
    : [];

  const [userBookmark] = dbUser
    ? await db
        .select()
        .from(bookmarks)
        .where(and(eq(bookmarks.userId, dbUser.id), eq(bookmarks.writingId, result.writing.id)))
    : [];

  const reactionCounts = await db
    .select({
      count: sql<number>`count(*)`,
      type: reactions.type,
    })
    .from(reactions)
    .where(eq(reactions.writingId, result.writing.id))
    .groupBy(reactions.type);

  return c.json({
    data: {
      ...result.writing,
      views: result.writing.views + 1,
      author: result.author,
      userReaction: userReaction?.type || null,
      isBookmarked: !!userBookmark,
      bookmarkFolder: userBookmark?.folderName || null,
      reactions: reactionCounts.reduce((acc, curr) => {
        acc[curr.type] = Number(curr.count);
        return acc;
      }, {} as Record<string, number>),
    },
  });
});

// Create writing
const createWritingSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  primaryEmotion: z.string(),
  secondaryEmotion: z.string().nullable().optional(),
  language: z.string().default("en"),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().nullable().optional(),
  isDraft: z.boolean().default(false),
});

app.post("/writings", async (c) => {
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const parsed = createWritingSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error }, 400);
  }

  const { title, content, primaryEmotion, secondaryEmotion, language, tags, coverImage, isDraft } = parsed.data;

  // Calculate reading time (roughly 200 words per minute)
  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const id = crypto.randomUUID();
  const slug = await generateUniqueSlug(title);

  const [newWriting] = await db
    .insert(writings)
    .values({
      id,
      userId: dbUser.id,
      title,
      slug,
      content,
      primaryEmotion,
      secondaryEmotion,
      language,
      tags,
      coverImage,
      readingTime,
      views: 0,
      isDraft,
      publishedAt: isDraft ? null : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return c.json({ data: newWriting });
});

// Update writing
app.put("/writings/:id", async (c) => {
  const id = c.req.param("id");
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

  const [existing] = await db.select().from(writings).where(eq(writings.id, id));
  if (!existing) return c.json({ error: "Writing not found" }, 404);
  if (existing.userId !== dbUser.id) return c.json({ error: "Forbidden" }, 403);

  const body = await c.req.json();
  const parsed = createWritingSchema.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error }, 400);

  const updateFields: any = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.content) {
    const wordCount = parsed.data.content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
    updateFields.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  if (parsed.data.isDraft === false && existing.isDraft) {
    updateFields.publishedAt = new Date();
  }

  const [updated] = await db
    .update(writings)
    .set(updateFields)
    .where(eq(writings.id, id))
    .returning();

  return c.json({ data: updated });
});

// Delete writing
app.delete("/writings/:id", async (c) => {
  const id = c.req.param("id");
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

  const [existing] = await db.select().from(writings).where(eq(writings.id, id));
  if (!existing) return c.json({ error: "Writing not found" }, 404);
  if (existing.userId !== dbUser.id) return c.json({ error: "Forbidden" }, 403);

  await db.delete(writings).where(eq(writings.id, id));
  return c.json({ success: true });
});

// ----------------------------------------------------
// Comments Routes
// ----------------------------------------------------

// List comments for writing
app.get("/comments", async (c) => {
  const writingId = c.req.query("writingId");
  if (!writingId) return c.json({ error: "writingId is required" }, 400);

  const limit = parseInt(c.req.query("limit") || "10");
  const offset = parseInt(c.req.query("offset") || "0");
  const sortBy = c.req.query("sortBy") || "newest"; // newest, oldest, popular

  // Find root comments (parentId is null)
  const conditions = [eq(comments.writingId, writingId), sql`${comments.parentId} IS NULL`];

  const list = await db
    .select({
      comment: comments,
      user: users,
      rating: reviews.rating,
      likesCount: sql<number>`(select count(*) from ${commentLikes} where ${commentLikes.commentId} = ${comments.id})`.mapWith(Number),
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .leftJoin(
      reviews,
      and(
        eq(reviews.userId, comments.userId),
        eq(reviews.writingId, comments.writingId)
      )
    )
    .where(and(...conditions))
    .orderBy(
      sortBy === "popular"
        ? desc(sql`(select count(*) from ${commentLikes} where ${commentLikes.commentId} = ${comments.id})`)
        : sortBy === "oldest"
        ? sql`${comments.createdAt} ASC`
        : desc(comments.createdAt)
    )
    .limit(limit)
    .offset(offset);

  // Query comment likes
  const writingLikes = await db
    .select({
      id: commentLikes.id,
      commentId: commentLikes.commentId,
      userId: commentLikes.userId,
    })
    .from(commentLikes)
    .innerJoin(comments, eq(commentLikes.commentId, comments.id))
    .where(eq(comments.writingId, writingId));

  const authUser = await getAuthUser(c);
  const dbUser = authUser ? await db.select().from(users).where(eq(users.id, authUser.id)).then(r => r[0]) : null;

  const likesByComment = new Map<string, string[]>();
  writingLikes.forEach((l) => {
    const arr = likesByComment.get(l.commentId) || [];
    arr.push(l.userId);
    likesByComment.set(l.commentId, arr);
  });

  const rootItems = list.map((item) => {
    const userIds = likesByComment.get(item.comment.id) || [];
    return {
      ...item.comment,
      user: item.user,
      rating: item.rating || null,
      likesCount: item.likesCount,
      hasLiked: dbUser ? userIds.includes(dbUser.id) : false,
      replies: [] as any[],
    };
  });

  const rootIds = rootItems.map(item => item.id);
  let repliesMapped: any[] = [];
  if (rootIds.length > 0) {
    const repliesList = await db
      .select({
        comment: comments,
        user: users,
        rating: reviews.rating,
        likesCount: sql<number>`(select count(*) from ${commentLikes} where ${commentLikes.commentId} = ${comments.id})`.mapWith(Number),
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .leftJoin(
        reviews,
        and(
          eq(reviews.userId, comments.userId),
          eq(reviews.writingId, comments.writingId)
        )
      )
      .where(inArray(comments.parentId, rootIds))
      .orderBy(desc(comments.createdAt));

    repliesMapped = repliesList.map((item) => {
      const userIds = likesByComment.get(item.comment.id) || [];
      return {
        ...item.comment,
        user: item.user,
        rating: item.rating || null,
        likesCount: item.likesCount,
        hasLiked: dbUser ? userIds.includes(dbUser.id) : false,
        replies: [],
      };
    });
  }

  // Nest replies inside root comments
  const map = new Map<string, any>();
  rootItems.forEach((item) => map.set(item.id, item));
  repliesMapped.forEach((reply) => {
    if (reply.parentId && map.has(reply.parentId)) {
      map.get(reply.parentId).replies.push(reply);
    }
  });

  return c.json({ data: rootItems });
});

// Create comment
app.post("/comments", async (c) => {
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const { writingId, parentId, content } = body;

  if (!writingId || !content) {
    return c.json({ error: "Missing fields" }, 400);
  }

  const id = crypto.randomUUID();
  const [newComment] = await db
    .insert(comments)
    .values({
      id,
      userId: dbUser.id,
      writingId,
      parentId,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Create Notification if notification recipient is not the commenter
  const [writingOwner] = await db.select({ userId: writings.userId }).from(writings).where(eq(writings.id, writingId));
  if (writingOwner && writingOwner.userId !== dbUser.id) {
    await db.insert(notifications).values({
      id: crypto.randomUUID(),
      recipientId: writingOwner.userId,
      actorId: dbUser.id,
      type: parentId ? "reply" : "comment",
      writingId,
      commentId: id,
      createdAt: new Date(),
    });
  }

  return c.json({ data: { ...newComment, user: dbUser } });
});

// Delete comment
app.delete("/comments/:id", async (c) => {
  const id = c.req.param("id");
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

  const [existing] = await db.select().from(comments).where(eq(comments.id, id));
  if (!existing) return c.json({ error: "Comment not found" }, 404);
  if (existing.userId !== dbUser.id) return c.json({ error: "Forbidden" }, 403);

  await db.delete(comments).where(eq(comments.id, id));
  return c.json({ success: true });
});

// Like/Unlike comment
app.post("/comments/:id/like", async (c) => {
  const commentId = c.req.param("id");
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

  const [existingLike] = await db
    .select()
    .from(commentLikes)
    .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, dbUser.id)));

  if (existingLike) {
    await db.delete(commentLikes).where(eq(commentLikes.id, existingLike.id));
    return c.json({ liked: false });
  } else {
    await db.insert(commentLikes).values({
      id: crypto.randomUUID(),
      commentId,
      userId: dbUser.id,
      createdAt: new Date(),
    });
    return c.json({ liked: true });
  }
});

// ----------------------------------------------------
// Interactions (Reactions & Bookmarks)
// ----------------------------------------------------

// Toggle Reaction
app.post("/writings/:id/reactions", async (c) => {
  const writingId = c.req.param("id");
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

  const { type } = await c.req.json(); // felt_this, inspired, powerful, beautiful, relatable, thoughtful
  if (!type) return c.json({ error: "Reaction type is required" }, 400);

  const [existing] = await db
    .select()
    .from(reactions)
    .where(and(eq(reactions.userId, dbUser.id), eq(reactions.writingId, writingId)));

  if (existing) {
    if (existing.type === type) {
      // Remove reaction if same type
      await db.delete(reactions).where(eq(reactions.id, existing.id));
      return c.json({ action: "removed" });
    } else {
      // Update reaction type
      await db
        .update(reactions)
        .set({ type })
        .where(eq(reactions.id, existing.id));
      return c.json({ action: "updated", type });
    }
  } else {
    // Add new reaction
    const id = crypto.randomUUID();
    await db.insert(reactions).values({
      id,
      userId: dbUser.id,
      writingId,
      type,
      createdAt: new Date(),
    });

    // Notify writing author
    const [writingOwner] = await db.select({ userId: writings.userId }).from(writings).where(eq(writings.id, writingId));
    if (writingOwner && writingOwner.userId !== dbUser.id) {
      await db.insert(notifications).values({
        id: crypto.randomUUID(),
        recipientId: writingOwner.userId,
        actorId: dbUser.id,
        type: "reaction",
        writingId,
        createdAt: new Date(),
      });
    }

    return c.json({ action: "added", type });
  }
});

// Toggle Bookmark
app.post("/writings/:id/bookmark", async (c) => {
  const writingId = c.req.param("id");
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

  const { folderName } = await c.req.json();
  const folder = folderName || "All";

  const [existing] = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, dbUser.id), eq(bookmarks.writingId, writingId)));

  if (existing) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
    return c.json({ bookmarked: false });
  } else {
    await db.insert(bookmarks).values({
      id: crypto.randomUUID(),
      userId: dbUser.id,
      writingId,
      folderName: folder,
      createdAt: new Date(),
    });
    return c.json({ bookmarked: true });
  }
});

// ----------------------------------------------------
// User Profile & Follows
// ----------------------------------------------------

// Get top users (by writing count, optional emotion filter)
app.get("/users/top", async (c) => {
  const emotion = c.req.query("emotion");
  
  const list = await db
    .select({
      id: writings.id,
      userId: writings.userId,
      primaryEmotion: writings.primaryEmotion,
    })
    .from(writings)
    .where(eq(writings.isDraft, false));

  const countMap = new Map<string, number>();
  list.forEach((w) => {
    if (emotion && w.primaryEmotion !== emotion) return;
    countMap.set(w.userId, (countMap.get(w.userId) || 0) + 1);
  });

  const sortedUserIds = Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map((e) => e[0]);

  if (sortedUserIds.length === 0) {
    return c.json({ data: [] });
  }

  const topUsers = await db
    .select()
    .from(users)
    .where(inArray(users.id, sortedUserIds));

  const resultData = topUsers.map((u) => ({
    user: u,
    writingsCount: countMap.get(u.id) || 0,
  })).sort((a, b) => b.writingsCount - a.writingsCount);

  return c.json({ data: resultData });
});

// Get dashboard statistics and user content management lists
app.get("/dashboard/stats", async (c) => {
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

  const userWritings = await db
    .select({
      id: writings.id,
      title: writings.title,
      slug: writings.slug,
      views: writings.views,
      isDraft: writings.isDraft,
      primaryEmotion: writings.primaryEmotion,
      createdAt: writings.createdAt,
    })
    .from(writings)
    .where(eq(writings.userId, dbUser.id))
    .orderBy(desc(writings.createdAt));

  const totalViews = userWritings.reduce((sum, w) => sum + (w.views || 0), 0);
  const publishedCount = userWritings.filter(w => !w.isDraft).length;
  const draftCount = userWritings.filter(w => w.isDraft).length;

  const followerCountRow = await db
    .select({ count: sql<number>`count(*)` })
    .from(follows)
    .where(eq(follows.followingId, dbUser.id));
  const followersCount = Number(followerCountRow[0]?.count || 0);

  const userWritingIds = userWritings.map(w => w.id);
  let recentComments: any[] = [];
  let recentReviews: any[] = [];

  if (userWritingIds.length > 0) {
    recentComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatar: users.avatar,
        },
        writingTitle: writings.title,
        writingSlug: writings.slug,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .innerJoin(writings, eq(comments.writingId, writings.id))
      .where(inArray(comments.writingId, userWritingIds))
      .orderBy(desc(comments.createdAt))
      .limit(5);

    recentReviews = await db
      .select({
        id: reviews.id,
        content: reviews.content,
        rating: reviews.rating,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatar: users.avatar,
        },
        writingTitle: writings.title,
        writingSlug: writings.slug,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .innerJoin(writings, eq(reviews.writingId, writings.id))
      .where(inArray(reviews.writingId, userWritingIds))
      .orderBy(desc(reviews.createdAt))
      .limit(5);
  }

  return c.json({
    data: {
      stats: {
        totalViews,
        publishedCount,
        draftCount,
        followersCount,
      },
      writings: userWritings,
      recentComments,
      recentReviews,
    }
  });
});

// Get all bookmarks for logged-in user
app.get("/bookmarks", async (c) => {
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

  const list = await db
    .select({
      writing: writings,
      author: users,
      folderName: bookmarks.folderName,
    })
    .from(bookmarks)
    .innerJoin(writings, eq(bookmarks.writingId, writings.id))
    .innerJoin(users, eq(writings.userId, users.id))
    .where(eq(bookmarks.userId, dbUser.id));

  const data = list.map((item) => ({
    ...item.writing,
    author: item.author,
    isBookmarked: true,
    bookmarkFolder: item.folderName || "All",
  }));

  return c.json({ data });
});

// Get recent global interactions (comments)
app.get("/interactions/recent", async (c) => {
  const listComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      user: {
        username: users.username,
        displayName: users.displayName,
      },
      writingSlug: writings.slug,
      writingTitle: writings.title,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .innerJoin(writings, eq(comments.writingId, writings.id))
    .orderBy(desc(comments.createdAt))
    .limit(3);

  return c.json({ data: listComments });
});

// Get current logged-in user profile
app.get("/users/me", async (c) => {
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ data: dbUser });
});

// Get user profile
app.get("/users/:username", async (c) => {
  const username = c.req.param("username").toLowerCase();
  const dbUser = await getOrCreateDbUser(c);

  const [profile] = await db.select().from(users).where(eq(users.username, username));
  if (!profile) return c.json({ error: "User not found" }, 404);

  // Check if current user is following this profile
  let isFollowing = false;
  if (dbUser) {
    const [followRecord] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, dbUser.id), eq(follows.followingId, profile.id)));
    isFollowing = !!followRecord;
  }

  // Get user emotion stats (count of writings per emotion)
  const emotionStats = await db
    .select({
      count: sql<number>`count(*)`,
      emotion: writings.primaryEmotion,
    })
    .from(writings)
    .where(and(eq(writings.userId, profile.id), eq(writings.isDraft, false)))
    .groupBy(writings.primaryEmotion);

  return c.json({
    data: {
      ...profile,
      isFollowing,
      emotions: emotionStats.reduce((acc, curr) => {
        acc[curr.emotion] = Number(curr.count);
        return acc;
      }, {} as Record<string, number>),
    },
  });
});

// Update Profile
app.put("/users/profile", async (c) => {
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

  const { displayName, bio, website, twitter, github, username } = await c.req.json();

  const updateFields: any = { updatedAt: new Date() };
  if (displayName !== undefined) updateFields.displayName = displayName;
  if (bio !== undefined) updateFields.bio = bio;
  if (website !== undefined) updateFields.website = website;
  if (twitter !== undefined) updateFields.twitter = twitter;
  if (github !== undefined) updateFields.github = github;

  if (username !== undefined && username.toLowerCase() !== dbUser.username) {
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanUsername.length < 3) return c.json({ error: "Username must be at least 3 characters" }, 400);

    const [existing] = await db.select().from(users).where(eq(users.username, cleanUsername));
    if (existing) return c.json({ error: "Username already taken" }, 400);
    updateFields.username = cleanUsername;
  }

  const [updated] = await db
    .update(users)
    .set(updateFields)
    .where(eq(users.id, dbUser.id))
    .returning();

  return c.json({ data: updated });
});

// Follow User
app.post("/users/:id/follow", async (c) => {
  const followingId = c.req.param("id");
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

  if (dbUser.id === followingId) return c.json({ error: "Cannot follow yourself" }, 400);

  const [targetUser] = await db.select().from(users).where(eq(users.id, followingId));
  if (!targetUser) return c.json({ error: "User not found" }, 404);

  const [existing] = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, dbUser.id), eq(follows.followingId, followingId)));

  if (existing) {
    // Unfollow
    await db.delete(follows).where(and(eq(follows.followerId, dbUser.id), eq(follows.followingId, followingId)));

    // Decrement following/follower counts
    await db
      .update(users)
      .set({ followingCount: Math.max(0, dbUser.followingCount - 1) })
      .where(eq(users.id, dbUser.id));
    await db
      .update(users)
      .set({ followersCount: Math.max(0, targetUser.followersCount - 1) })
      .where(eq(users.id, followingId));

    return c.json({ following: false });
  } else {
    // Follow
    await db.insert(follows).values({
      followerId: dbUser.id,
      followingId,
      createdAt: new Date(),
    });

    // Increment counts
    await db
      .update(users)
      .set({ followingCount: dbUser.followingCount + 1 })
      .where(eq(users.id, dbUser.id));
    await db
      .update(users)
      .set({ followersCount: targetUser.followersCount + 1 })
      .where(eq(users.id, followingId));

    // Send notification
    await db.insert(notifications).values({
      id: crypto.randomUUID(),
      recipientId: followingId,
      actorId: dbUser.id,
      type: "follow",
      createdAt: new Date(),
    });

    return c.json({ following: true });
  }
});

// ----------------------------------------------------
// Notifications Routes
// ----------------------------------------------------

app.get("/notifications", async (c) => {
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

  const list = await db
    .select({
      notification: notifications,
      actor: users,
      writing: writings,
    })
    .from(notifications)
    .innerJoin(users, eq(notifications.actorId, users.id))
    .leftJoin(writings, eq(notifications.writingId, writings.id))
    .where(eq(notifications.recipientId, dbUser.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  const data = list.map((item) => ({
    ...item.notification,
    actor: item.actor,
    writing: item.writing,
  }));

  return c.json({ data });
});

app.post("/notifications/:id/read", async (c) => {
  const id = c.req.param("id");
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.recipientId, dbUser.id)));

  return c.json({ success: true });
});

// Admin Seed Endpoint (Passcode protected: 17092006)
app.post("/admin/seed", async (c) => {
  try {
    const { passcode } = await c.req.json();
    if (passcode !== "17092006") {
      return c.json({ error: "Invalid passcode" }, 403);
    }

    const seedWritings = [...rawSeedWritings];
    const quotes = [...rawQuotes];
    const authors = [...rawAuthors];

    // Seed 45 additional real distinct writings in different languages to exceed 50+ database writings
    for (let i = 0; i < 45; i++) {
      const quote = quotes[i % quotes.length];
      const author = authors[i % authors.length];
      seedWritings.push({
        title: `${quote.text.split(" ").slice(0, 4).join(" ")}... (Part ${i + 1})`,
        primaryEmotion: quote.emotion,
        language: quote.lang,
        content: `<p>${quote.text}</p><p>— Shared by ${author}</p>`,
        readingTime: 1,
        tags: [...quote.tags, `#part${i + 1}`]
      });
    }

    // Default admin seed user
    const seedUserId = "admin-writer-id";
    const [existingUser] = await db.select().from(users).where(eq(users.id, seedUserId));
    if (!existingUser) {
      await db.insert(users).values({
        id: seedUserId,
        username: "literature_master",
        displayName: "Literature Master",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=literature",
        bio: "Curator of celebrated classical poetry and literary masterpieces.",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 5 New seed writers
    const seedWriters = [
      {
        id: "writer-tagore",
        username: "tagore_devotee",
        displayName: "Tagore Devotee",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=tagore",
        bio: "Explorer of Gitanjali, Bangla verses, and spiritual love.",
      },
      {
        id: "writer-byron",
        username: "byron_shadow",
        displayName: "Byron Shadow",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=byron",
        bio: "Dark romanticist, capturing melancholic shadows and gothic lines.",
      },
      {
        id: "writer-rumi",
        username: "rumi_spirit",
        displayName: "Rumi Spirit",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=rumi",
        bio: "Whirling dervish of mystic love, gratitude, and divine connection.",
      },
      {
        id: "writer-faiz",
        username: "faiz_voice",
        displayName: "Faiz Voice",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=faiz",
        bio: "Poet of revolutionary angst, Urdu ghazals, and motivation.",
      },
      {
        id: "writer-goethe",
        username: "goethe_soul",
        displayName: "Goethe Soul",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=goethe",
        bio: "Sturm und Drang philosopher writing classic German and international ballads.",
      },
    ];

    for (const writer of seedWriters) {
      const [existing] = await db.select().from(users).where(eq(users.id, writer.id));
      if (!existing) {
        await db.insert(users).values({
          ...writer,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    const writerIds = [seedUserId, ...seedWriters.map((w) => w.id)];

    let seededCount = 0;
    for (let index = 0; index < seedWritings.length; index++) {
      const post = seedWritings[index];
      const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const [existingPost] = await db.select().from(writings).where(eq(writings.slug, slug));
      if (!existingPost) {
        const assignedUserId = writerIds[index % writerIds.length];
        await db.insert(writings).values({
          id: crypto.randomUUID(),
          userId: assignedUserId,
          title: post.title,
          slug,
          content: post.content,
          primaryEmotion: post.primaryEmotion,
          language: post.language,
          readingTime: post.readingTime,
          tags: post.tags,
          isDraft: false,
          views: Math.floor(Math.random() * 200) + 10,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        seededCount++;
      }
    }

    return c.json({ success: true, message: `Successfully seeded ${seededCount} new writings. Total seeded: ${seedWritings.length}.` });
  } catch (e: any) {
    return c.json({ error: e.message || "Seeding failed" }, 500);
  }
});

// Reviews Endpoints
app.get("/writings/:writingId/reviews", async (c) => {
  const writingId = c.req.param("writingId");
  const limit = parseInt(c.req.query("limit") || "10");
  const offset = parseInt(c.req.query("offset") || "0");
  const sortBy = c.req.query("sortBy") || "newest"; // newest, oldest, highest_rating, lowest_rating

  let orderByClause = desc(reviews.createdAt);
  if (sortBy === "oldest") {
    orderByClause = sql`${reviews.createdAt} ASC`;
  } else if (sortBy === "highest_rating") {
    orderByClause = desc(reviews.rating);
  } else if (sortBy === "lowest_rating") {
    orderByClause = sql`${reviews.rating} ASC`;
  }

  const data = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      content: reviews.content,
      createdAt: reviews.createdAt,
      user: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar,
      },
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.writingId, writingId))
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  const stats = await db
    .select({
      avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      count: sql<number>`COUNT(${reviews.id})`,
    })
    .from(reviews)
    .where(eq(reviews.writingId, writingId));

  return c.json({
    data,
    avgRating: Number(stats[0]?.avgRating || 0).toFixed(1),
    totalReviews: Number(stats[0]?.count || 0),
  });
});

app.post("/writings/:writingId/reviews", async (c) => {
  const dbUser = await getOrCreateDbUser(c);
  if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

  const writingId = c.req.param("writingId");
  const { rating, content } = await c.req.json();

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return c.json({ error: "Rating must be an integer between 1 and 5" }, 400);
  }

  // Check if writing exists
  const [writing] = await db.select().from(writings).where(eq(writings.id, writingId));
  if (!writing) return c.json({ error: "Writing not found" }, 404);

  // Check if user already reviewed
  const [existingReview] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, dbUser.id), eq(reviews.writingId, writingId)));

  let reviewId = existingReview?.id;

  if (existingReview) {
    await db
      .update(reviews)
      .set({
        rating,
        content: content || null,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, existingReview.id));
  } else {
    reviewId = crypto.randomUUID();
    await db.insert(reviews).values({
      id: reviewId,
      userId: dbUser.id,
      writingId,
      rating,
      content: content || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Notify post owner
    if (writing.userId !== dbUser.id) {
      await db.insert(notifications).values({
        id: crypto.randomUUID(),
        recipientId: writing.userId,
        actorId: dbUser.id,
        type: "review",
        writingId,
        createdAt: new Date(),
      });
    }
  }

  return c.json({ success: true, id: reviewId });
});

// Admin Moderation API Group
app.get("/admin/writings", async (c) => {
  const passcode = c.req.header("X-Admin-Passcode");
  if (passcode !== "17092006") return c.json({ error: "Unauthorized" }, 401);

  const list = await db
    .select({
      id: writings.id,
      title: writings.title,
      slug: writings.slug,
      primaryEmotion: writings.primaryEmotion,
      language: writings.language,
      createdAt: writings.createdAt,
    })
    .from(writings)
    .orderBy(desc(writings.createdAt));

  return c.json({ data: list });
});

app.delete("/admin/writings/:id", async (c) => {
  const passcode = c.req.header("X-Admin-Passcode");
  if (passcode !== "17092006") return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  await db.delete(writings).where(eq(writings.id, id));
  return c.json({ success: true });
});

app.get("/admin/users", async (c) => {
  const passcode = c.req.header("X-Admin-Passcode");
  if (passcode !== "17092006") return c.json({ error: "Unauthorized" }, 401);

  const list = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));

  return c.json({ data: list });
});

app.delete("/admin/users/:id", async (c) => {
  const passcode = c.req.header("X-Admin-Passcode");
  if (passcode !== "17092006") return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  await db.delete(users).where(eq(users.id, id));
  return c.json({ success: true });
});

app.get("/admin/comments", async (c) => {
  const passcode = c.req.header("X-Admin-Passcode");
  if (passcode !== "17092006") return c.json({ error: "Unauthorized" }, 401);

  const list = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      user: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
      },
      writingTitle: writings.title,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .innerJoin(writings, eq(comments.writingId, writings.id))
    .orderBy(desc(comments.createdAt));

  return c.json({ data: list });
});

app.delete("/admin/comments/:id", async (c) => {
  const passcode = c.req.header("X-Admin-Passcode");
  if (passcode !== "17092006") return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  await db.delete(comments).where(eq(comments.id, id));
  return c.json({ success: true });
});

app.get("/admin/reviews", async (c) => {
  const passcode = c.req.header("X-Admin-Passcode");
  if (passcode !== "17092006") return c.json({ error: "Unauthorized" }, 401);

  const list = await db
    .select({
      id: reviews.id,
      content: reviews.content,
      rating: reviews.rating,
      createdAt: reviews.createdAt,
      user: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
      },
      writingTitle: writings.title,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .innerJoin(writings, eq(reviews.writingId, writings.id))
    .orderBy(desc(reviews.createdAt));

  return c.json({ data: list });
});

app.delete("/admin/reviews/:id", async (c) => {
  const passcode = c.req.header("X-Admin-Passcode");
  if (passcode !== "17092006") return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  await db.delete(reviews).where(eq(reviews.id, id));
  return c.json({ success: true });
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
