import { drizzle } from "drizzle-orm/node-postgres";
import { pgSchema, pgTable } from "drizzle-orm/pg-core";

import { queryLogger } from "@/lib/logger";

import { Pool } from "pg";
import { env } from "@/app/env";

const dbClient = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const createTable =
  env.PG_SCHEMA === "public" ? pgTable : pgSchema(env.PG_SCHEMA).table;

export const kil = drizzle(dbClient, {
  logger: {
    logQuery(query: string, params: unknown[]) {
      queryLogger.silly(query, params);
    },
  },
});
