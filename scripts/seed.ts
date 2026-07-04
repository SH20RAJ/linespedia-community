import { db } from "../src/db";
import { users, writings } from "../src/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const SEED_USER = {
  id: "admin-writer-id",
  username: "literature_master",
  displayName: "Literature Master",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=literature",
  bio: "Curator of celebrated classical poetry and literary masterpieces.",
};

const SEED_POSTS = [
  {
    title: "A Red, Red Rose",
    primaryEmotion: "love",
    language: "en",
    content: `<p>O my Luve is like a red, red rose<br>That’s newly sprung in June;<br>O my Luve is like the melody<br>That’s sweetly played in tune.</p><p>So fair art thou, my bonnie lass,<br>So deep in luve am I;<br>And I will luve thee still, my dear,<br>Till a’ the seas gang dry.</p>`,
    readingTime: 1,
    tags: ["#poetry", "#love", "#classic"],
  },
  {
    title: "O Captain! My Captain!",
    primaryEmotion: "sad",
    language: "en",
    content: `<p>O Captain! my Captain! our fearful trip is done,<br>The ship has weather’d every rack, the prize we sought is won,<br>The port is near, the bells I hear, the people all exulting,<br>While follow eyes the steady keel, the vessel grim and daring;<br>But O heart! heart! heart!<br>O the bleeding drops of red,<br>Where on the deck my Captain lies,<br>Fallen cold and dead.</p>`,
    readingTime: 2,
    tags: ["#poetry", "#mourning", "#classic"],
  },
  {
    title: "Invictus",
    primaryEmotion: "motivation",
    language: "en",
    content: `<p>Out of the night that covers me,<br>Black as the pit from pole to pole,<br>I thank whatever gods may be<br>For my unconquerable soul.</p><p>In the fell clutch of circumstance<br>I have not winced nor cried aloud.<br>Under the bludgeonings of chance<br>My head is bloody, but unbowed.</p><p>It matters not how strait the gate,<br>How charged with punishments the scroll,<br>I am the master of my fate,<br>I am the captain of my soul.</p>`,
    readingTime: 2,
    tags: ["#poetry", "#strength", "#motivation"],
  },
  {
    title: "Hazaron Khwaishein Aisi",
    primaryEmotion: "nostalgia",
    language: "ur",
    content: `<p>Hazāroñ ḳhvāisheñ aisī ki har ḳhvāish pe dam nikle,<br>Bahut nikle mere armān lekin phir bhī kam nikle.</p><p>Nikalnā ḳhuld se aadam kā sunte aa.e haiñ lekin,<br>Bahut be-ābrū ho kar tere kūche se ham nikle.</p>`,
    readingTime: 1,
    tags: ["#ghazal", "#ghalib", "#shayari"],
  },
  {
    title: "Khudi Ko Kar Buland",
    primaryEmotion: "motivation",
    language: "ur",
    content: `<p>Khudi ko kar buland itna ki har taqdeer se pehle,<br>Khuda bande se khud pooche bata teri raza kya hai.</p>`,
    readingTime: 1,
    tags: ["#iqbal", "#motivation", "#shayari"],
  },
  {
    title: "Stopping by Woods on a Snowy Evening",
    primaryEmotion: "peace",
    language: "en",
    content: `<p>Whose woods these are I think I know.<br>His house is in the village though;<br>He will not see me stopping here<br>To watch his woods fill up with snow.</p><p>The woods are lovely, dark and deep,<br>But I have promises to keep,<br>And miles to go before I sleep,<br>And miles to go before I sleep.</p>`,
    readingTime: 2,
    tags: ["#poetry", "#peace", "#frost"],
  },
  {
    title: "A Dream Within a Dream",
    primaryEmotion: "dream",
    language: "en",
    content: `<p>Take this kiss upon the brow!<br>And, in parting from you now,<br>Thus much let me avow—<br>You are not wrong, who deem<br>That my days have been a dream;<br>Yet if hope has flown away<br>In a night, or in a day,<br>In a vision, or in none,<br>Is it therefore the less gone?<br>All that we see or seem<br>Is but a dream within a dream.</p>`,
    readingTime: 2,
    tags: ["#poetry", "#dream", "#mystery"],
  },
  {
    title: "In the Middle of Difficulty",
    primaryEmotion: "hope",
    language: "en",
    content: `<p>In the middle of difficulty lies opportunity.</p>`,
    readingTime: 1,
    tags: ["#quote", "#hope", "#einstein"],
  },
  {
    title: "Peace Begins With a Smile",
    primaryEmotion: "peace",
    language: "en",
    content: `<p>Peace begins with a smile.</p>`,
    readingTime: 1,
    tags: ["#quote", "#peace", "#teresa"],
  },
  {
    title: "The Road Not Taken",
    primaryEmotion: "motivation",
    language: "en",
    content: `<p>Two roads diverged in a yellow wood,<br>And sorry I could not travel both<br>And be one traveler, long I stood<br>And looked down one as far as I could<br>To where it bent in the undergrowth;</p><p>I shall be telling this with a sigh<br>Somewhere ages and ages hence:<br>Two roads diverged in a wood, and I—<br>I took the one less traveled by,<br>And that has made all the difference.</p>`,
    readingTime: 2,
    tags: ["#poetry", "#choices", "#motivation"],
  },
];

async function main() {
  console.log("Seeding database...");

  // Check/Insert User
  const [existingUser] = await db.select().from(users).where(eq(users.id, SEED_USER.id));
  if (!existingUser) {
    await db.insert(users).values({
      ...SEED_USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("Created seed user.");
  } else {
    console.log("Seed user already exists.");
  }

  // Insert Writings
  for (const post of SEED_POSTS) {
    const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const [existingPost] = await db.select().from(writings).where(eq(writings.slug, slug));
    if (!existingPost) {
      await db.insert(writings).values({
        id: crypto.randomUUID(),
        userId: SEED_USER.id,
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
      console.log(`Seeded post: ${post.title}`);
    } else {
      console.log(`Post already exists: ${post.title}`);
    }
  }

  console.log("Database seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
