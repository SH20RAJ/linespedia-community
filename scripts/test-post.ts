import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import { eq, like } from "drizzle-orm";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const databaseUrl = process.env.DATABASE_URL!;
const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

async function run() {
  const slug = "in-memoriam-82-i-wage-not-any-feud-with-death-lord-alfred-tennyson";
  console.log("Querying writing for slug with fallback logic:", slug);
  try {
    let result = null;
    const [exactResult] = await db
      .select({
        writing: schema.writings,
        author: schema.users,
      })
      .from(schema.writings)
      .innerJoin(schema.users, eq(schema.writings.userId, schema.users.id))
      .where(eq(schema.writings.slug, slug));

    if (exactResult) {
      result = exactResult;
    } else {
      const prefix = slug.slice(0, 30);
      const candidates = await db
        .select({
          writing: schema.writings,
          author: schema.users,
        })
        .from(schema.writings)
        .innerJoin(schema.users, eq(schema.writings.userId, schema.users.id))
        .where(like(schema.writings.slug, `${prefix}%`));

      const targetNormalized = slug.toLowerCase().replace(/_/g, "-");
      const matched = candidates.find(
        (c) => c.writing.slug.toLowerCase().replace(/_/g, "-") === targetNormalized
      );
      if (matched) {
        result = matched;
      }
    }

    if (!result) {
      console.log("No writing found even with fallback!");
      return;
    }

    console.log("Found writing successfully via fallback:", {
      id: result.writing.id,
      title: result.writing.title,
      slug: result.writing.slug,
    });
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

run();
