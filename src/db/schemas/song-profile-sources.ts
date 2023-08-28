import { type InferModel } from "drizzle-orm";
import { pgEnum, pgSchema, timestamp, varchar } from "drizzle-orm/pg-core";
import { type RegisteredUser, users } from "@/db/schemas/users";

const sourcesEnum = pgEnum("source", ["YouTube", "Deezer", "Spotify"]);

export const songProfileSources = pgSchema(process.env.PGSCHEMA ?? "app").table(
  "song_profile_sources",
  {
    userId: varchar("user_id")
      .primaryKey()
      .notNull()
      .references(() => users.id),
    source: sourcesEnum("source").notNull(),
    sourceUrl: varchar("source_url").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
);

export type SongSource = Omit<InferModel<typeof songProfileSources>, "userId">;

export type SongProfileWithSources = RegisteredUser & {
  sources: SongSource[];
  ranking: { position: number; likes: number };
};
