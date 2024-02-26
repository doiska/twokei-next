import { createTable } from "@/db/Kil";
import { varchar } from "drizzle-orm/pg-core";

export const playerEmbedArts = createTable("player_embed_arts", {
  name: varchar("name"),
  url: varchar("url").primaryKey().notNull(),
  author: varchar("author").notNull(),
  authorUrl: varchar("author_url"),
});
