import { createTable } from "@/db/Kil";
import {
  integer,
  jsonb,
  pgMaterializedView,
  pgSchema,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { env } from "@/app/env";
import { eq, sql } from "drizzle-orm";

const view =
  env.PG_SCHEMA === "public"
    ? pgMaterializedView
    : pgSchema(env.PG_SCHEMA).materializedView;

export const analyticsTrackInfo = createTable("analytics_track_info", {
  id: varchar("id").notNull().primaryKey(),
  spotify_id: varchar("spotify_id"),
  title: varchar("title"),
  artists: varchar("artists"),
  durationInMs: integer("duration_in_ms"),
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

export const listeningRanking = pgMaterializedView("ranking").as((qb) => {
  return qb
    .select({
      userId: analyticsUserListenedTracks.userId,
      listenedInMs:
        sql<number>`SUM(${analyticsTrackInfo.durationInMs} * ${analyticsUserListenedTracks.listened})`.as(
          "listened_in_ms",
        ),
      position:
        sql<number>`ROW_NUMBER() OVER (ORDER BY SUM(${analyticsTrackInfo.durationInMs} * ${analyticsUserListenedTracks.listened}) DESC)`.as(
          "position",
        ),
    })
    .from(analyticsUserListenedTracks)
    .innerJoin(
      analyticsTrackInfo,
      eq(analyticsUserListenedTracks.trackId, analyticsTrackInfo.id),
    )
    .groupBy(analyticsUserListenedTracks.userId)
    .orderBy(sql`listened_in_ms DESC`);
});
