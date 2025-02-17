import fs from "fs";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import PG from "pg";

import * as schema from "./schema";

export * from "drizzle-orm/sql";
export { alias } from "drizzle-orm/pg-core";

const connectionString = process.env.DATABASE_URL ?? "";

const pool = new PG.Pool({
  connectionString: connectionString,
});

const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema });

export { db, pool };
