import { drizzle } from "drizzle-orm/node-postgres";
import { pgSchema } from "drizzle-orm/pg-core";

import { logger, queryLogger } from "@/modules/logger-transport";

import { Pool } from "pg";
import { env } from "@/app/env";

const dbClient = new Pool({
  connectionString: process.env.DATABASE_URL,
});

logger.info("Connecting to database...");

export const kil = drizzle(dbClient, {
  logger: {
    logQuery(query: string, params: unknown[]) {
      queryLogger.silly(query, params);
    },
  },
});

export const createTable = pgSchema(env.PG_SCHEMA).table;
