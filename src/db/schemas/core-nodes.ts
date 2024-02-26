import { boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createTable } from "@/db/Kil";

export const coreNodes = createTable("core_nodes", {
  name: varchar("name").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  currentStatus: varchar("current_status").default("DISCONNECTED"),
  url: varchar("url").primaryKey(),
  auth: varchar("auth").notNull(),
  secure: boolean("secure").notNull().default(false),
  group: varchar("group").notNull().default("default"),
  updatedAt: timestamp("updated_at").defaultNow(),
});
