import { createTable } from "@/db/Kil";
import { jsonb, varchar } from "drizzle-orm/pg-core";
import type { Market } from "@spotify/web-api-ts-sdk";

type TwoLetterString = `${string}${string}`;
type Popularity = Record<TwoLetterString | "_", number>;

export const playerPresets = createTable("player_presets", {
  id: varchar("name").primaryKey(),
  search: varchar("search").notNull(),
  market: varchar("market").$type<Market>(),
  mood: jsonb("mood").default([]).$type<string[]>(),
  genres: jsonb("genres").default([]).$type<string[]>(),
  popularity: jsonb("popularity").$type<Popularity>(),
});
