import { db } from "@/db";
import { writings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const runtime = "edge";

export async function GET() {
  let list: any[] = [];
  try {
    list = await db
      .select({
        slug: writings.slug,
        updatedAt: writings.updatedAt,
      })
      .from(writings)
      .where(eq(writings.isDraft, false))
      .orderBy(desc(writings.createdAt))
      .limit(50000);
  } catch (e) {
    console.warn("Could not fetch writings for sitemap", e);
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

  const urlsXml = baseUrls
    .map(
      (url) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("");

  const postsXml = list
    .map(
      (post) => `
  <url>
    <loc>https://linespedia.com/post/${post.slug}</loc>
    <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("");

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlsXml}
  ${postsXml}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
