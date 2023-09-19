import { createTable } from "@/db/Kil";
import { jsonb, varchar } from "drizzle-orm/pg-core";
import { PlayerDump } from "@twokei/shoukaku";

export const playerSessions = createTable("player_sessions", {
  guildId: varchar("guild_id").primaryKey().notNull(),
  state: jsonb("state").notNull().default({}).$type<PlayerDump>(),
});
