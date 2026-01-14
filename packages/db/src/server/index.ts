import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import PG from "pg";

import * as schemaDrizzle from "./schema";

export * from "drizzle-orm/sql";
export { alias } from "drizzle-orm/pg-core";

const connectionString = process.env.DATABASE_URL ?? "";

const pool = new PG.Pool({
  connectionString: connectionString,
});

const db: NodePgDatabase<typeof schemaDrizzle> = drizzle(pool, {
  schema: schemaDrizzle,
});

export async function migrateDb(folder: string) {
  await migrate(db, { migrationsFolder: folder });
}

export async function executeRaw(sql: string) {
  await db.execute(sql);
}

export { db, pool };
