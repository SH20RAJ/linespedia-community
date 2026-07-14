import { db } from "../src/db";
import { writings, users, comments, reactions } from "../src/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const MYSTERY_WRITINGS = [
  {
    authorUsername: "gulzar_poetry",
    title: "Khamosh Saye (खामोश साये)",
    content: `<p>सामने कोई नहीं है फिर भी आहट सी है,<br>हवा के रुख में एक अजब सी सरसराहट सी है।<br>ये जो परछाईं सी रेंगती है दीवारों पर,<br>लगता है कोई राज़ छुपाए बैठा है साए में।</p>`,
    tags: ["#mystery", "#night", "#shadows", "#gulzar"]
  },
  {
    authorUsername: "jaun_elia",
    title: "Ek Bhed Jo Kaha Na Gaya (एक भेद जो कहा न गया)",
    content: `<p>मेरे कमरे की हवाओं में कोई बात तो है,<br>इस अंधेरे में छुपी कोई नई ज़ात तो है।<br>तुम जो कहते हो कि सब ठीक है यहाँ यारो,<br>फिर दरख्तों पर कोई चीखता क्यूँ है रातों में?</p>`,
    tags: ["#mystery", "#jaunelia", "#darkness", "#secrets"]
  },
  {
    authorUsername: "literature_master",
    title: "The Raven (Excerpt)",
    content: `<p>Once upon a midnight dreary, while I pondered, weak and weary,<br>Over many a quaint and curious volume of forgotten lore—<br>While I nodded, nearly napping, suddenly there came a tapping,<br>As of some one gently rapping, rapping at my chamber door.<br>"'Tis some visitor," I muttered, "tapping at my chamber door—<br>            Only this and nothing more."</p>`,
    tags: ["#mystery", "#classic", "#poe", "#gothic"]
  },
  {
    authorUsername: "literature_master",
    title: "Kubla Khan (Excerpt)",
    content: `<p>In Xanadu did Kubla Khan<br>A stately pleasure-dome decree:<br>Where Alph, the sacred river, ran<br>Through caverns measureless to man<br>   Down to a sunless sea.<br>So twice five miles of fertile ground<br>With walls and towers were girdled round.</p>`,
    tags: ["#mystery", "#dream", "#classic", "#mystical"]
  },
  {
    authorUsername: "suryakant_tripathi_nirala",
    title: "Kuhu (कुहू)",
    content: `<p>रात की गहरी कुहू में कौन गाता है वहाँ,<br>नैन मूँदे सो रहा है जब यह सारा जहाँ।<br>किस वेदना का भार है जो गाता है वह गीत,<br>या ढूंढता है कोई खोया हुआ सा प्रीत।</p>`,
    tags: ["#mystery", "#nature", "#nirala", "#hindi"]
  }
];

async function main() {
  console.log("Seeding mystery content...");

  for (const item of MYSTERY_WRITINGS) {
    // Find the author user ID
    const [author] = await db
      .select()
      .from(users)
      .where(eq(users.username, item.authorUsername));

    if (!author) {
      console.warn(`Author @${item.authorUsername} not found. Skipping.`);
      continue;
    }

    const cleanSlug = item.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-_]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const id = crypto.randomUUID();

    const [existing] = await db
      .select()
      .from(writings)
      .where(eq(writings.slug, cleanSlug));

    if (!existing) {
      await db.insert(writings).values({
        id,
        userId: author.id,
        title: item.title,
        slug: cleanSlug,
        content: item.content,
        primaryEmotion: "mystery",
        language: item.tags.includes("#classic") ? "en" : "hi",
        tags: item.tags,
        readingTime: 1,
        views: Math.floor(Math.random() * 50) + 10,
        isDraft: false,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`+ Seeded mystery post: "${item.title}"`);
    } else {
      console.log(`~ Post already exists: "${item.title}"`);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

main().catch(err => {
  console.error("Failed to seed mystery content:", err);
  process.exit(1);
});
