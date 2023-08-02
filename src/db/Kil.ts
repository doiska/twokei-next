import { queryLogger } from '@/modules/logger-transport';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const dbClient = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const kil = drizzle(dbClient, {
  logger: {
    logQuery (query: string, params: unknown[]) {
      queryLogger.debug(query, params);
    },
  },
});
