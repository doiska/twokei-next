import { drizzle } from 'drizzle-orm/node-postgres';

import { logger, queryLogger } from '@/modules/logger-transport';

import { Pool } from 'pg';

const dbClient = new Pool({
  connectionString: process.env.DATABASE_URL,
});

logger.info('Connecting to database...');
logger.info(`Database URL: ${process.env.DATABASE_URL}`);

export const kil = drizzle(dbClient, {
  logger: {
    logQuery (query: string, params: unknown[]) {
      queryLogger.debug(query, params);
    },
  },
});
