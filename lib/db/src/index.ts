import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Database is optional — the mobile app routes don't require it.
// Log a warning instead of crashing when DATABASE_URL is absent.
export let pool: pg.Pool | null = null;
export let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  console.warn(
    "[db] DATABASE_URL is not set — database features are disabled. " +
    "Set DATABASE_URL to enable persistence.",
  );
}

export * from "./schema";
