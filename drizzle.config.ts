import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schemas",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: "postgres://postgres:postgres@localhost:5432/postgres",
  },
} satisfies Config;
