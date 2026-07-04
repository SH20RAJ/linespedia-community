import { db } from "@/db";
import { writings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  let list: any[] = [];
  try {
    list = await db
      .select()
      .from(writings)
      .where(eq(writings.isDraft, false))
      .orderBy(desc(writings.createdAt))
      .limit(20);
  } catch (e) {
    console.warn("Could not fetch writings for RSS feed", e);
  }

  const itemsXml = list
    .map((post) => {
      const plainText = post.content.replace(/<[^>]*>/g, "").slice(0, 200);
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://linespedia.com/post/${post.slug}</link>
      <guid>https://linespedia.com/post/${post.slug}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${plainText}]]></description>
    </item>`;
    })
    .join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Linespedia Community</title>
    <link>https://linespedia.com</link>
    <description>The cleanest writing-first social platform organized by emotions</description>
    <atom:link href="https://linespedia.com/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
