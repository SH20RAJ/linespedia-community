import { db } from "../src/db";
import { writings } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Cleaning database slugs...");
  const list = await db.select().from(writings);
  
  for (const item of list) {
    // Strip non-ASCII characters to keep slugs strictly English
    const cleanSlug = item.slug
      .toLowerCase()
      .replace(/[^a-z0-9\s-_]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
      
    if (cleanSlug !== item.slug && cleanSlug.length > 0) {
      await db.update(writings).set({ slug: cleanSlug }).where(eq(writings.id, item.id));
      console.log(`Updated slug: "${item.slug}" -> "${cleanSlug}"`);
    }
  }
  console.log("Slug cleaning complete!");
  process.exit(0);
}

main().catch(err => {
  console.error("Failed to clean database slugs:", err);
  process.exit(1);
});
