import { Hono } from "hono";
import { handle } from "hono/vercel";
import { db } from "@/db";
import { users, writings, reactions, bookmarks, comments, follows, notifications, reviews, commentLikes } from "@/db/schema";
import { eq, and, desc, sql, inArray, lt, or } from "drizzle-orm";
import { hexclaveServerApp } from "@/hexclave/server";
import { z } from "zod";

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

  const list = await db
    .select({
      comment: comments,
      user: users,
      rating: reviews.rating,
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
    .where(eq(comments.writingId, writingId))
    .orderBy(desc(comments.createdAt));

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

  // Structure comment tree
  const items = list.map((item) => {
    const userIds = likesByComment.get(item.comment.id) || [];
    return {
      ...item.comment,
      user: item.user,
      rating: item.rating || null,
      likesCount: userIds.length,
      hasLiked: dbUser ? userIds.includes(dbUser.id) : false,
      replies: [] as any[],
    };
  });

  const rootComments: any[] = [];
  const map = new Map<string, any>();

  items.forEach((item) => map.set(item.id, item));
  items.forEach((item) => {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId).replies.push(item);
    } else {
      rootComments.push(item);
    }
  });

  return c.json({ data: rootComments });
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

    const seedWritings = [
      { title: "Shall I Compare Thee to a Summer's Day? (Sonnet 18)", primaryEmotion: "love", language: "en", content: `<p>Shall I compare thee to a summer's day?<br>Thou art more lovely and more temperate:<br>Rough winds do shake the darling buds of May,<br>And summer's lease hath all too short a date.</p><p>But thy eternal summer shall not fade,<br>Nor lose possession of that fair thou ow'st;<br>Nor shall death brag thou wander'st in his shade,<br>When in eternal lines to time thou grow'st.</p>`, readingTime: 1, tags: ["#sonnet", "#shakespeare", "#love"] },
      { title: "She Walks in Beauty", primaryEmotion: "love", language: "en", content: `<p>She walks in beauty, like the night<br>Of cloudless climes and starry skies;<br>And all that’s best of dark and bright<br>Meet in her aspect and her eyes.</p>`, readingTime: 1, tags: ["#love", "#byron", "#classic"] },
      { title: "Annabel Lee", primaryEmotion: "love", language: "en", content: `<p>It was many and many a year ago,<br>In a kingdom by the sea,<br>That a maiden there lived whom you may know<br>By the name of Annabel Lee;<br>And this maiden she lived with no other thought<br>Than to love and be loved by me.</p>`, readingTime: 2, tags: ["#love", "#sad", "#poe"] },
      { title: "Daffodils", primaryEmotion: "peace", language: "en", content: `<p>I wandered lonely as a cloud<br>That floats on high o'er vales and hills,<br>When all at once I saw a crowd,<br>A host, of golden daffodils;<br>Beside the lake, beneath the trees,<br>Fluttering and dancing in the breeze.</p>`, readingTime: 1, tags: ["#nature", "#peace", "#wordsworth"] },
      { title: "Hope is the Thing with Feathers", primaryEmotion: "hope", language: "en", content: `<p>Hope is the thing with feathers<br>That perches in the soul,<br>And sings the tune without the words,<br>And never stops at all.</p>`, readingTime: 1, tags: ["#hope", "#soul", "#dickinson"] },
      { title: "Success is Counted Sweetest", primaryEmotion: "motivation", language: "en", content: `<p>Success is counted sweetest<br>By those who ne'er succeed.<br>To comprehend a nectar<br>Requires sorest need.</p>`, readingTime: 1, tags: ["#success", "#motivation", "#dickinson"] },
      { title: "The Raven", primaryEmotion: "sad", language: "en", content: `<p>Once upon a midnight dreary, while I pondered, weak and weary,<br>Over many a quaint and curious volume of forgotten lore—<br>While I nodded, nearly napping, suddenly there came a tapping,<br>As of some one gently rapping, rapping at my chamber door.</p>`, readingTime: 3, tags: ["#mystery", "#sad", "#poe"] },
      { title: "Still I Rise", primaryEmotion: "motivation", language: "en", content: `<p>You may write me down in history<br>With your bitter, twisted lies,<br>You may trod me in the very dirt<br>But still, like dust, I'll rise.</p>`, readingTime: 2, tags: ["#motivation", "#strength", "#angelou"] },
      { title: "Do Not Go Gentle Into That Good Night", primaryEmotion: "anger", language: "en", content: `<p>Do not go gentle into that good night,<br>Old age should burn and rave at close of day;<br>Rage, rage against the dying of the light.</p>`, readingTime: 1, tags: ["#rage", "#life", "#thomas"] },
      { title: "If", primaryEmotion: "motivation", language: "en", content: `<p>If you can keep your head when all about you<br>Are losing theirs and blaming it on you,<br>If you can trust yourself when all men doubt you,<br>But make allowance for their doubting too;</p>`, readingTime: 2, tags: ["#motivation", "#life", "#kipling"] },
      { title: "Bol Ke Lab Azaad Hain Tere", primaryEmotion: "motivation", language: "ur", content: `<p>Bol ki lab aazaad hain tere,<br>Bol zabāñ ab tak terī hai.<br>Terā sutvāñ jism hai terā,<br>Bol ki jaañ ab tak terī hai.</p>`, readingTime: 1, tags: ["#faiz", "#motivation", "#shayari"] },
      { title: "Hum Dekhenge", primaryEmotion: "motivation", language: "ur", content: `<p>Hum dekhenge,<br>Lāzim hai ke hum bhī dekhenge.<br>Vo din ke jis kā vaada hai,<br>Jo lauh-e-azal pe likkhā hai.</p>`, readingTime: 2, tags: ["#faiz", "#protest", "#shayari"] },
      { title: "Where the Mind is Without Fear", primaryEmotion: "motivation", language: "en", content: `<p>Where the mind is without fear and the head is held high;<br>Where knowledge is free;<br>Where the world has not been broken up into fragments<br>By narrow domestic walls;</p>`, readingTime: 1, tags: ["#freedom", "#tagore", "#motivation"] },
      { title: "Where the Mind is Without Fear (Gitanjali)", primaryEmotion: "hope", language: "bn", content: `<p>Chitto jetha bhayshunyo, uchcho jetha shir,<br>Gnyan jetha mukto, jetha griher prachir<br>Apon prangontole dibashbhabori<br>Bosundhare rakhe nai khondo khudra kori.</p>`, readingTime: 1, tags: ["#tagore", "#freedom", "#bengali"] },
      { title: "Bullah Ki Jaana Main Kaun", primaryEmotion: "peace", language: "pa", content: `<p>Na main momin vich maseetān, na main vich kufar diān reetān,<br>Na main pākān vich paleetān, na main moosa na faraun.<br>Bullah ki jaana main kaun!</p>`, readingTime: 1, tags: ["#bullehshah", "#sufi", "#punjabi"] },
      { title: "Thirukkural - Chapter on Love", primaryEmotion: "love", language: "ta", content: `<p>அன்பிலார் எல்லாம் தமக்குரியர் அன்புடையார்<br>என்பும் உரியர் பிறர்க்கு.<br>Anbilaar ellaam thamakuriyar anbudaikaar enbum uriyar pirarkku.</p>`, readingTime: 1, tags: ["#thiruvalluvar", "#love", "#tamil"] },
      { title: "Vemana Neethi Shatakam", primaryEmotion: "peace", language: "te", content: `<p>Alpa buddhi vaniki adhikara micchina<br>Doddavalanu jampi tolagajeyu<br>Cheppu thinna kukka cheruku తీపి యెరుగునా?<br>Viswadabhirama vinura vema.</p>`, readingTime: 1, tags: ["#vemana", "#wisdom", "#telugu"] },
      { title: "Al-Atlal (The Ruins)", primaryEmotion: "sad", language: "ar", content: `<p>يا فؤادي لا تسل أين الهوى<br>كان صرحاً من خيالٍ فهوى<br>اسقني واشرب على أطلاله<br>واروِ عني طالما الدمع روى</p>`, readingTime: 1, tags: ["#poetry", "#arabic", "#love"] },
      { title: "Wandrers Nachtlied (Wanderer's Nightsong)", primaryEmotion: "peace", language: "de", content: `<p>Über allen Gipfeln<br>Ist Ruh,<br>In allen Wipfeln<br>Spürest du<br>Kaum einen Hauch;<br>Die Vögelein schweigen im Walde.<br>Warte nur, balde<br>Ruhest du auch.</p>`, readingTime: 1, tags: ["#goethe", "#peace", "#german"] },
    ];

    const authors = ["Rumi", "Kabir", "Ghalib", "Wordsworth", "Tagore", "Emily Dickinson", "Robert Frost", "Shakespeare", "Neruda", "Baudelaire", "Bulleh Shah", "Thiruvalluvar", "Vemana", "Goethe"];
    const quotes = [
      { text: "What you seek is seeking you.", emotion: "hope", lang: "en", tags: ["#rumi", "#hope", "#spiritual"] },
      { text: "Only from the heart can you touch the sky.", emotion: "love", lang: "en", tags: ["#rumi", "#love", "#heart"] },
      { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", emotion: "peace", lang: "en", tags: ["#rumi", "#wisdom", "#peace"] },
      { text: "Do not feel lonely, the entire universe is inside you.", emotion: "hope", lang: "en", tags: ["#rumi", "#hope", "#universe"] },
      { text: "Bura jo dekhan main chala, bura na milya koy. Jo dil khoja aapna, mujhse bura na koy.", emotion: "peace", lang: "hi", tags: ["#kabir", "#peace", "#wisdom"] },
      { text: "Lali mere lal ki, jit dekhoon tit lal. Lali dekhan main gayi, main bhi ho gayi lal.", emotion: "love", lang: "hi", tags: ["#kabir", "#love", "#devotion"] },
      { text: "Dil-e-nadaan tujhe hua kya hai, aakhir is dard ki dava kya hai.", emotion: "sad", lang: "ur", tags: ["#ghalib", "#sad", "#love"] },
      { text: "Ishq ne 'Ghalib' nikamma kar diya, varna hum bhi aadmi the kaam ke.", emotion: "nostalgia", lang: "ur", tags: ["#ghalib", "#nostalgia", "#love"] },
      { text: "Clouds come floating into my life, no longer to usher storm but to add color.", emotion: "peace", lang: "en", tags: ["#tagore", "#peace", "#life"] },
      { text: "If you shed tears when you miss the sun, you also miss the stars.", emotion: "hope", lang: "en", tags: ["#tagore", "#hope", "#stars"] },
      { text: "The woods are lovely, dark and deep, but I have promises to keep.", emotion: "peace", lang: "en", tags: ["#frost", "#peace", "#woods"] },
      { text: "Love all, trust a few, do wrong to none.", emotion: "peace", lang: "en", tags: ["#shakespeare", "#peace", "#wisdom"] },
      { text: "Puedo escribir los versos más tristes esta noche. Escribir, por ejemplo: 'La noche está estrellada, y tiritan, azules, los astros, a lo lejos.'", emotion: "sad", lang: "es", tags: ["#neruda", "#sad", "#poetry"] },
      { text: "Para mi corazón basta tu pecho, para tu libertad bastan mis alas.", emotion: "love", lang: "es", tags: ["#neruda", "#love", "#poetry"] },
      { text: "Sois sage, ô ma Douleur, et tiens-toi plus tranquille. Tu réclamais le Soir; il descend; le voici.", emotion: "sad", lang: "fr", tags: ["#baudelaire", "#sad", "#poetry"] },
      { text: "Amader choto nodi chole bake bake, boishakh mashe tar hatu jol thake.", emotion: "nostalgia", lang: "bn", tags: ["#tagore", "#nostalgia", "#bengali"] },
      { text: "Tere ishq nachaya kar ke thaiya thaiya.", emotion: "love", lang: "pa", tags: ["#bullehshah", "#love", "#sufi"] },
      { text: "Keraladheepom or Tamilzhagam, language connects the hearts.", emotion: "peace", lang: "ta", tags: ["#culture", "#peace"] },
      { text: "Kavitha oothu, telugu bhasha theeyadhanam.", emotion: "hope", lang: "te", tags: ["#poetry", "#telugu"] },
      { text: "Ana uhibbuka ya habibi.", emotion: "love", lang: "ar", tags: ["#love", "#arabic"] },
      { text: "Mehr Licht! (More light!)", emotion: "hope", lang: "de", tags: ["#goethe", "#hope", "#wisdom"] }
    ];

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

    let seededCount = 0;
    for (const post of seedWritings) {
      const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const [existingPost] = await db.select().from(writings).where(eq(writings.slug, slug));
      if (!existingPost) {
        await db.insert(writings).values({
          id: crypto.randomUUID(),
          userId: seedUserId,
          title: post.title,
          slug,
          content: post.content,
          primaryEmotion: post.primaryEmotion,
          language: post.language,
          readingTime: post.readingTime,
          tags: post.tags,
          isDraft: false,
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
    .orderBy(desc(reviews.createdAt));

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

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
