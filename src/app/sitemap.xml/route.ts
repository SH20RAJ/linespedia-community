import { db } from "@/db";
import { writings, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  let posts: any[] = [];
  let userList: any[] = [];
  try {
    posts = await db
      .select({
        slug: writings.slug,
        updatedAt: writings.updatedAt,
      })
      .from(writings)
      .where(eq(writings.isDraft, false))
      .orderBy(desc(writings.createdAt))
      .limit(50000);
      
    userList = await db
      .select({
        username: users.username,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .limit(10000);
  } catch (e) {
    console.warn("Could not fetch database records for sitemap", e);
  }

  const baseUrls = [
    "https://linespedia.com",
    "https://linespedia.com/explore",
    "https://linespedia.com/about",
    "https://linespedia.com/contact",
    "https://linespedia.com/privacy",
    "https://linespedia.com/terms",
    "https://linespedia.com/latest",
    "https://linespedia.com/trending",
  ];

  const emotions = [
    "love",
    "sad",
    "hope",
    "peace",
    "motivation",
    "anger",
    "fear",
    "humor",
    "nostalgia",
    "dream",
    "gratitude",
    "mystery",
  ];

  const baseXml = baseUrls
    .map(
      (url) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join("");

  const emotionsXml = emotions
    .map(
      (emotion) => `
  <url>
    <loc>https://linespedia.com/emotion/${emotion}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("");

  const profilesXml = userList
    .map(
      (user) => `
  <url>
    <loc>https://linespedia.com/profile/${encodeURIComponent(user.username.toLowerCase())}</loc>
    <lastmod>${new Date(user.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("");

  const postsXml = posts
    .map(
      (post) => `
  <url>
    <loc>https://linespedia.com/post/${encodeURIComponent(post.slug)}</loc>
    <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("");

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${baseXml}
  ${emotionsXml}
  ${profilesXml}
  ${postsXml}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
