import { pgSchema, varchar } from 'drizzle-orm/pg-core';
import { type InferModel } from 'drizzle-orm';

export const songChannels = pgSchema(process.env.PGSCHEMA ?? 'app')
  .table(
    'song_channels',
    {
      guildId: varchar('guild_id')
        .primaryKey()
        .notNull(),
      channelId: varchar('channel_id')
        .notNull(),
      messageId: varchar('message_id')
        .notNull(),
    },
  );

export type SongChannel = InferModel<typeof songChannels>;
