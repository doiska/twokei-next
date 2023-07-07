import { drizzle } from 'drizzle-orm/node-postgres';

import { Pool } from 'pg';
import { queryLogger } from '@/modules/logger-transport';

const dbClient = new Pool({
  connectionString: `${process.env.DATABASE_URL}?currentSchema=${process.env.PGSCHEMA}`,
});

export const kil = drizzle(dbClient, {
  logger: {
    logQuery(query: string, params: unknown[]) {
      queryLogger.debug(query, params);
    },
  },
});
