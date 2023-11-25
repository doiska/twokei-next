import { varchar } from "drizzle-orm/pg-core";
import { createTable } from "@/db/Kil";
import { InferSelectModel } from "drizzle-orm";

export const songChannels = createTable("player_song_channels", {
  guildId: varchar("guild_id").primaryKey().notNull(),
  channelId: varchar("channel_id").notNull(),
  messageId: varchar("message_id").notNull(),
});

export type SongChannel = InferSelectModel<typeof songChannels>;
