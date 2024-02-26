import { createTable } from "@/db/Kil";
import { boolean, timestamp, varchar } from "drizzle-orm/pg-core";

export const coreScheduler = createTable("core_scheduler", {
  name: varchar("name").notNull(),
  service: varchar("service").primaryKey(),
  schedule: varchar("schedule").notNull(),
  enabled: boolean("enabled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
