import { createTable } from "@/db/Kil";
import { jsonb, timestamp, varchar } from "drizzle-orm/pg-core";

export const playerPlaylists = createTable("player_playlists", {
  id: varchar("id", { length: 255 }).primaryKey(),
  categoryId: varchar("category_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 255 }),
  href: varchar("href", { length: 255 }),
  genres: jsonb("genres").default([]).$type<
    Array<{
      genre: string;
      popularity: number;
    }>
  >(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});
