import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config({
  path: './src/.env',
});

export default {
  schema: './src/db/schemas',
  out: './drizzle',
  driver: 'pg',
  schemaFilter: ['old'],
  dbCredentials: {
    connectionString: process!.env.DATABASE_URL!,
  },
} satisfies Config;
