import { MetadataRoute } from "next";
import { db } from "@/db";
import { writings } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let list: any[] = [];
  try {
    list = await db.select().from(writings).where(eq(writings.isDraft, false));
  } catch (e) {
    // Avoid crashing the build if database is not reachable at build time
    console.warn("Could not fetch writings for sitemap", e);
  }

  const postUrls = list.map((post) => ({
    url: `https://linespedia.com/post/${post.slug}`,
    lastModified: new Date(post.updatedAt),
  }));

  return [
    {
      url: "https://linespedia.com",
      lastModified: new Date(),
    },
    {
      url: "https://linespedia.com/explore",
      lastModified: new Date(),
    },
    ...postUrls,
  ];
}
