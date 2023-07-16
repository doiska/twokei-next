import { pgEnum, pgSchema, timestamp, varchar } from 'drizzle-orm/pg-core';
import { type InferModel } from 'drizzle-orm';

import { users } from '@/db/schemas/users';
import { type SongProfile } from '@/db/schemas/song-profile';

const sourcesEnum = pgEnum('source', ['YouTube', 'Deezer', 'Spotify']);

export const songSource = pgSchema(process.env.PGSCHEMA ?? 'app')
  .table('song_profile_sources', {
    userId: varchar('user_id')
      .primaryKey()
      .notNull()
      .references(() => users.userId),
    source: sourcesEnum('source')
      .notNull(),
    sourceUrl: varchar('source_url')
      .notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow(),
  });

export type SongSource = Omit<InferModel<typeof songSource>, 'userId'>;

export type SongProfileWithSources = SongProfile & { sources: SongSource[] };
