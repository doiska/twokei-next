import { createTable } from "@/db/Kil";
import { jsonb, numeric, varchar } from "drizzle-orm/pg-core";

export const playerPresets = createTable("player_presets", {
  id: varchar("name").primaryKey(),
  name: varchar("name"),
  market: varchar("market"),
  popularity: numeric("popularity"),
  categories: jsonb("categories").notNull().default([]).$type<string[]>(),
});
