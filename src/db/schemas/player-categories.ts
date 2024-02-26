import { createTable } from "@/db/Kil";
import { timestamp, varchar } from "drizzle-orm/pg-core";

export const playerCategories = createTable("player_categories", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 255 }).notNull(),
  market: varchar("market", { length: 255 }).notNull(),
  locale: varchar("locale", { length: 255 }).notNull(),
  href: varchar("href", { length: 255 }),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});
