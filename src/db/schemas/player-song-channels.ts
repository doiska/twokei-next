import { timestamp, varchar } from "drizzle-orm/pg-core";
import { createTable } from "@/db/Kil";
import { InferSelectModel } from "drizzle-orm";

export const playerSongChannels = createTable("player_song_channels", {
  guildId: varchar("guild_id").primaryKey().notNull(),
  channelId: varchar("channel_id").notNull(),
  messageId: varchar("message_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SongChannel = InferSelectModel<typeof playerSongChannels>;
