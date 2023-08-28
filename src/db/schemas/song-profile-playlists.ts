import type { InferModel } from "drizzle-orm";
import { pgSchema, timestamp, varchar } from "drizzle-orm/pg-core";

export const songProfilePlaylists = pgSchema(
  process.env.PGSCHEMA ?? "app",
).table("song_user_playlists", {
  userId: varchar("user_id").primaryKey().notNull(),
  playlistName: varchar("playlist_name").notNull(),
  playlistUrl: varchar("playlist_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SongProfilePlaylist = InferModel<typeof songProfilePlaylists>;
