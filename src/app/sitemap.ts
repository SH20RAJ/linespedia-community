import { MetadataRoute } from "next";
import { db } from "@/db";
import { writings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const SITEMAP_LIMIT = 20000; // Chunk limit to avoid D1 memory overhead and Google limits

export async function generateSitemaps() {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(writings)
      .where(eq(writings.isDraft, false));

    const numSitemaps = Math.max(1, Math.ceil(count / SITEMAP_LIMIT));
    return Array.from({ length: numSitemaps }, (_, id) => ({ id }));
  } catch (e) {
    console.warn("Could not fetch count for generateSitemaps", e);
    return [{ id: 0 }];
  }
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const offset = id * SITEMAP_LIMIT;

  let list: any[] = [];
  try {
    list = await db
      .select()
      .from(writings)
      .where(eq(writings.isDraft, false))
      .limit(SITEMAP_LIMIT)
      .offset(offset);
  } catch (e) {
    console.warn(`Could not fetch writings for sitemap chunk ${id}`, e);
  }

  const postUrls = list.map((post) => ({
    url: `https://linespedia.com/post/${post.slug}`,
    lastModified: new Date(post.updatedAt),
  }));

  // Base URLs only on the first index sheet
  if (id === 0) {
    return [
      { url: "https://linespedia.com", lastModified: new Date() },
      { url: "https://linespedia.com/explore", lastModified: new Date() },
      { url: "https://linespedia.com/about", lastModified: new Date() },
      { url: "https://linespedia.com/contact", lastModified: new Date() },
      { url: "https://linespedia.com/privacy", lastModified: new Date() },
      { url: "https://linespedia.com/terms", lastModified: new Date() },
      { url: "https://linespedia.com/latest", lastModified: new Date() },
      { url: "https://linespedia.com/trending", lastModified: new Date() },
      ...postUrls,
    ];
  }

  return postUrls;
}
