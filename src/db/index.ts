import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Fallback to a dummy connection string during build time to prevent build-time failures
const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:dummy@ep-dummy.us-east-2.aws.neon.tech/neondb?sslmode=require";

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
