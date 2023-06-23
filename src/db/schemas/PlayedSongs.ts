import { integer, pgSchema, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { users } from './Users';

export const playedSongs = pgSchema(process.env.PGSCHEMA ?? 'app').table('played_songs', {
  userId: varchar('user_id').primaryKey().notNull().references(() => users.userId),
  guildId: varchar('guild_id').notNull(),
  amount: integer('amount').notNull().default(1),
  songName: varchar('song_name').notNull(),
  songUrl: varchar('song_url').notNull(),
  songLength: integer('song_length').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, ps => {
  return {
    songUrlUnique: uniqueIndex('songUrlUnique').on(ps.songUrl, ps.userId)
  };
});