import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import { like } from "drizzle-orm";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const databaseUrl = process.env.DATABASE_URL!;
const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

async function run() {
  console.log("Searching for writings containing 'memoriam' or 'wage'...");
  try {
    const list = await db
      .select({
        id: schema.writings.id,
        title: schema.writings.title,
        slug: schema.writings.slug,
      })
      .from(schema.writings)
      .where(like(schema.writings.slug, "%memoriam%"));

    console.log("Matching writings:", list);
  } catch (error) {
    console.error("Error searching writings:", error);
  }
}

run();
