import { pgSchema, timestamp, varchar } from 'drizzle-orm/pg-core';
import { type InferModel } from 'drizzle-orm';

import { users } from '@/db/schemas/users';

export const songProfile = pgSchema(process.env.PGSCHEMA ?? 'app')
  .table(
    'song_profile',
    {
      userId: varchar('user_id')
        .primaryKey()
        .notNull()
        .references(() => users.userId),
      displayName: varchar('display_name')
        .notNull(),
      pronouns: varchar('pronouns'),
      lastSynced: timestamp('last_synced')
        .notNull()
        .defaultNow(),
    },
  );

export type SongProfile = InferModel<typeof songProfile>;
