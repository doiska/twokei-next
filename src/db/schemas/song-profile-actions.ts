import { pgEnum, pgSchema, timestamp, varchar } from 'drizzle-orm/pg-core';
import { type InferModel } from 'drizzle-orm';

import { users } from '@/db/schemas/users';

const actionsEnum = pgEnum('song_profile_action', ['follow', 'like']);

export const songProfileActions = pgSchema(process.env.PGSCHEMA ?? 'app')
  .table(
    'song_profile_actions',
    {
      userId: varchar('user_id')
        .primaryKey()
        .notNull()
        .references(() => users.userId),
      targetId: varchar('target_id')
        .notNull()
        .references(() => users.userId),
      action: actionsEnum('action')
        .notNull(),
      createdAt: timestamp('created_at')
        .notNull()
        .defaultNow(),
    },
  );

export type SongProfileAction = InferModel<typeof songProfileActions>;
