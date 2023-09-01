import { jsonb, varchar } from "drizzle-orm/pg-core";
import { createTable } from "@/db/Kil";

export const tracks = createTable("analytics_tracks", {
  id: varchar("track_id").primaryKey().notNull(),
  artists: jsonb("artists").default([]),
  genres: jsonb("genres").default([]),
});
