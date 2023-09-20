import { createTable } from "@/db/Kil";
import { jsonb, varchar } from "drizzle-orm/pg-core";
import { PlayerDump } from "@twokei/shoukaku";
import { TrackQueue } from "@/music/structures/TrackQueue";

export const playerSessions = createTable("player_sessions", {
  guildId: varchar("guild_id").primaryKey().notNull(),
  queue: jsonb("queue")
    .notNull()
    .default([])
    .$type<ReturnType<TrackQueue["dump"]>>(),
  state: jsonb("state").notNull().default({}).$type<PlayerDump>(),
});
