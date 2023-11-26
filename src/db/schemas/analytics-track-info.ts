import { createTable } from "@/db/Kil";
import {
  integer,
  jsonb,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const analyticsTrackInfo = createTable("analytics_track_info", {
  id: varchar("id").notNull().primaryKey(),
  spotify_id: varchar("spotify_id").notNull(),
  title: varchar("title").notNull(),
  author: varchar("author"),
  duration: integer("duration"),
});

export const analyticsUserListenedTracks = createTable(
  "analytics_user_listened_tracks",
  {
    userId: varchar("user_id").notNull(),
    trackId: varchar("track_id").notNull(),
    guildId: varchar("guild_id"),
    listened: integer("listened").default(1),
    properties: jsonb("properties"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    composite: unique().on(table.userId, table.trackId, table.guildId),
  }),
);

export const analyticsUserAddedTracks = createTable(
  "analytics_user_added_tracks",
  {
    userId: varchar("user_id").notNull(),
    trackId: varchar("track_id").notNull(),
    guildId: varchar("guild_id"),
    listened: integer("listened").default(1),
    properties: jsonb("properties"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    composite: unique().on(table.userId, table.trackId, table.guildId),
  }),
);
