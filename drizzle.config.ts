import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/**/*.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  schemaFilter: [process.env.PG_SCHEMA!],
  verbose: true,
  strict: true,
} satisfies Config;
