import { type InferModel } from "drizzle-orm";
import { varchar } from "drizzle-orm/pg-core";
import { createTable } from "@/db/Kil";

export const songChannels = createTable("song_channels", {
  guildId: varchar("guild_id").primaryKey().notNull(),
  channelId: varchar("channel_id").notNull(),
  messageId: varchar("message_id").notNull(),
});

export type SongChannel = InferModel<typeof songChannels>;
