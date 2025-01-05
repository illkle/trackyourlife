import fs from "fs";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import PG from "pg";

import * as schema from "./schema";

export * from "drizzle-orm/sql";
export { alias } from "drizzle-orm/pg-core";

const connectionString = process.env.DATABASE_URL ?? "";

const pool = new PG.Pool({
  connectionString: connectionString,
});

const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema });

let migrationsDone = false;

const migrateIfNeeded = async () => {
  if (process.env.MIGRATE !== "true") return;

  if (migrationsDone) return;

  console.log("Running migrations(if present)");

  const folder =
    process.env.NODE_ENV === "development"
      ? "../../packages/db/drizzle" // Local development when root folder is apps/next
      : "./drizzle"; // Docker build when drizzle folder is copied to build dir

  console.log("Migration folder:", folder);
  try {
    const files = fs.readdirSync(folder);
    console.log("Migration files found:", files);
  } catch (error) {
    console.error("Error reading migration folder:", error);
  }

  await migrate(db, {
    migrationsFolder: folder,
  });

  console.log("Migrations done");

  migrationsDone = true;
};

// This is dirty, should be refactored
await migrateIfNeeded();

export { db, pool, migrateIfNeeded };
