import { pgEnum, timestamp, varchar } from "drizzle-orm/pg-core";
import { type RegisteredUser, coreUsers } from "@/db/schemas/core-users";
import { createTable } from "@/db/Kil";
import type { InferSelectModel } from "drizzle-orm";

const sourcesEnum = pgEnum("source", ["YouTube", "Deezer", "Spotify"]);

export const songProfileSources = createTable("song_profile_sources", {
  userId: varchar("user_id")
    .primaryKey()
    .notNull()
    .references(() => coreUsers.id),
  source: sourcesEnum("source").notNull(),
  sourceUrl: varchar("source_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SongSource = Omit<
  InferSelectModel<typeof songProfileSources>,
  "userId"
>;

export type SongProfileWithSources = RegisteredUser & {
  sources: SongSource[];
  ranking: { position: number; likes: number };
};
