import { db } from "@/db";
import { writings, users } from "@/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export async function getInitialWritings({
  feedType = "latest",
  emotion,
  userId,
  limit = 10,
}: {
  feedType?: string;
  emotion?: string;
  userId?: string;
  limit?: number;
}) {
  let conditions: any[] = [eq(writings.isDraft, false)];

  if (userId) {
    conditions.push(eq(writings.userId, userId));
  }
  if (emotion) {
    conditions.push(eq(writings.primaryEmotion, emotion));
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
  } else if (feedType === "for-you") {
    orderedQuery = queryBuilder.orderBy(sql`random()`);
  } else {
    orderedQuery = queryBuilder.orderBy(desc(writings.createdAt));
  }

  const results = await orderedQuery.limit(limit);

  // Map to flat JSON-serializable structure
  return results.map((item) => ({
    ...item.writing,
    author: {
      username: item.author.username,
      displayName: item.author.displayName,
      avatar: item.author.avatar,
    },
    createdAt: item.writing.createdAt.toISOString(),
    updatedAt: item.writing.updatedAt.toISOString(),
    publishedAt: item.writing.publishedAt ? item.writing.publishedAt.toISOString() : null,
  }));
}

export async function getInitialUserProfile(username: string) {
  const [user] = await db.select().from(users).where(eq(users.username, username.toLowerCase()));
  if (!user) return null;
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function getInitialTopUsers(emotion?: string) {
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
    return [];
  }

  const topUsers = await db
    .select()
    .from(users)
    .where(inArray(users.id, sortedUserIds));

  const results = topUsers.map((u) => ({
    user: {
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatar: u.avatar,
    },
    writingsCount: countMap.get(u.id) || 0,
  }));

  return results.sort((a, b) => b.writingsCount - a.writingsCount);
}
