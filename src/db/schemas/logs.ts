import { serial, varchar } from "drizzle-orm/pg-core";
import { createTable } from "@/db/Kil";

export const logs = createTable("logs", {
  id: serial("id"),
  env: varchar("environment").default("Development"),
  severity: varchar("severity").notNull(),
  source: varchar("source").default("Twokei"),
  message: varchar("message").notNull(),
  trace: varchar("trace"),
});
