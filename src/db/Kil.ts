import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';

const dbClient = new Pool({
  connectionString: `${process.env.DATABASE_URL}?currentSchema=${process.env.PGSCHEMA}`,
});

export const kil = drizzle(dbClient, {
  logger: true
});
