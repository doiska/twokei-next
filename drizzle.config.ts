import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({
  path: './src/.env'
});

export default {
  schema: './src/db/schemas',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  }
} satisfies Config;
