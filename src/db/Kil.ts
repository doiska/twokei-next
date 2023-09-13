import { drizzle } from "drizzle-orm/node-postgres";
import { pgSchema } from "drizzle-orm/pg-core";

import { logger, queryLogger } from "@/lib/logger";

import { Pool } from "pg";
import { env } from "@/app/env";

const dbClient = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const createTable = pgSchema(env.PG_SCHEMA).table;

export const kil = drizzle(dbClient, {
  logger: {
    logQuery(query: string, params: unknown[]) {
      queryLogger.silly(query, params);
    },
  },
});

logger.info("Connected to database!");
