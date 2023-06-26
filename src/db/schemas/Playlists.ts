import {pgSchema, timestamp, varchar} from 'drizzle-orm/pg-core';

export const playlists = pgSchema(process.env.PGSCHEMA ?? 'app').table('users_playlists', {
  userId: varchar('user_id').primaryKey().notNull(),
  playlistName: varchar('playlist_name').notNull(),
  playlistUrl: varchar('playlist_url').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});