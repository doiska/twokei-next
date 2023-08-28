import { jsonb, pgSchema, varchar } from "drizzle-orm/pg-core";

export const tracks = pgSchema(process.env.PGSCHEMA ?? "app").table(
  "analytics_tracks",
  {
    id: varchar("track_id").primaryKey().notNull(),
    artists: jsonb("artists").default([]),
    genres: jsonb("genres").default([]),
  },
);
