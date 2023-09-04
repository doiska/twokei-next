import type { InferSelectModel } from "drizzle-orm";
import { timestamp, varchar } from "drizzle-orm/pg-core";
import { createTable } from "@/db/Kil";

export const songProfilePlaylists = createTable("song_user_playlists", {
  userId: varchar("user_id").primaryKey().notNull(),
  playlistName: varchar("playlist_name").notNull(),
  playlistUrl: varchar("playlist_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SongProfilePlaylist = InferSelectModel<typeof songProfilePlaylists>;
