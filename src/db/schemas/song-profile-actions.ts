import { type InferModel } from "drizzle-orm";
import { pgEnum, pgSchema, timestamp, varchar } from "drizzle-orm/pg-core";

const actionsEnum = pgEnum("song_profile_action", ["dislike", "like"]);

export const songProfileActions = pgSchema(process.env.PGSCHEMA ?? "app").table(
  "song_profile_actions",
  {
    userId: varchar("user_id").notNull(),
    targetId: varchar("target_id").notNull(),
    action: actionsEnum("action").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
);

export type SongProfileAction = InferModel<typeof songProfileActions>;
