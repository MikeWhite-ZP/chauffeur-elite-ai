import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function runMigrations() {
  console.log("Running migrations...");
  
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
  
  await pool.end();
}

runMigrations();
