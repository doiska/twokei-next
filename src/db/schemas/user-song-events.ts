import { jsonb, pgEnum, pgSchema, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from '@/db/schemas/users';
import type { InferModel } from 'drizzle-orm';

export type UserEvent = InferModel<typeof userSongEvents, 'insert'> & {
  properties: UserEventProperties
};

export interface UserEventProperties {
  guildId?: string
  track?: {
    title: string
    uri: string
    author?: string
    source: string
  }
  [key: string]: unknown
}

const eventsEnum = pgEnum('song_user_events_type', [
  'create_queue',
  'play_song',
  'like_song',
  'dislike_song',
  'add_to_playlist',
  'remove_from_playlist',
]);

const sourcesEnum = pgEnum('song_user_events_source', [
  'Guild',
  'DM',
  'Web',
]);

export const userSongEvents = pgSchema(process.env.PGSCHEMA ?? 'app')
  .table('song_user_events', {
    userId: varchar('user_id')
      .notNull()
      .references(() => users.userId),
    source: sourcesEnum('source')
      .notNull(),
    event: eventsEnum('event')
      .notNull(),
    properties: jsonb('properties'),
    createdAt: timestamp('created_at')
      .defaultNow(),
  });
