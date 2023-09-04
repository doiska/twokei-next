import { timestamp, varchar } from "drizzle-orm/pg-core";
import { createTable } from "@/db/Kil";

export const guilds = createTable("guilds", {
  guildId: varchar("guild_id").primaryKey().notNull(),
  name: varchar("name"),
  locale: varchar("locale").notNull().default("pt_br"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});
