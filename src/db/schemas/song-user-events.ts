import type { InferModel } from "drizzle-orm";
import {
  jsonb,
  pgEnum,
  pgSchema,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "@/db/schemas/users";

import { type ResolvableTrack } from "@/music/structures/ResolvableTrack";

export type UserEvent = InferModel<typeof songUserEvents, "insert"> & {
  properties: UserEventProperties;
};

export interface UserEventProperties {
  guildId?: string;
  track?: ReturnType<ResolvableTrack["short"]>;

  [key: string]: unknown;
}

const eventsEnum = pgEnum("song_user_events_type", [
  "create_queue",
  "add_song",
  "heard_song",
  "like_song",
  "dislike_song",
  "add_to_playlist",
  "remove_from_playlist",
]);

const sourcesEnum = pgEnum("song_user_events_source", ["Guild", "DM", "Web"]);

export const songUserEvents = pgSchema(process.env.PGSCHEMA ?? "app").table(
  "song_user_events",
  {
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    source: sourcesEnum("source").notNull(),
    event: eventsEnum("event").notNull(),
    properties: jsonb("properties"),
    createdAt: timestamp("created_at").defaultNow(),
  },
);
