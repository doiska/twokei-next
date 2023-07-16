import { jsonb, pgEnum, pgSchema, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from '@/db/schemas/users';
import type { InferModel } from 'drizzle-orm';

const eventsEnum = pgEnum('song_user_events_type', [
  'create_queue',
  'play_song',
  'skip_song',
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

export const userEvents = pgSchema(process.env.PGSCHEMA ?? 'app')
  .table('song_user_events', {
    userId: varchar('user_id')
      .primaryKey()
      .notNull()
      .references(() => users.userId),
    source: sourcesEnum('source')
      .notNull(),
    event: eventsEnum('event')
      .notNull(),
    properties: jsonb('properties'),
    createdAt: timestamp('created_at')
      .notNull()
      .defaultNow(),
  });

export type UserEvent = InferModel<typeof userEvents>;
