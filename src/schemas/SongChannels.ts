import { pgSchema, pgTable, varchar } from 'drizzle-orm/pg-core';

export const songChannels = pgSchema(process.env.PGSCHEMA ?? 'app').table('song_channels', {
  guildId: varchar('guild_id').primaryKey().notNull(),
  channelId: varchar('channel_id').notNull(),
  messageId: varchar('message_id').notNull(),
});