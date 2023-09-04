import { type InferSelectModel } from "drizzle-orm";
import { pgEnum, timestamp, varchar } from "drizzle-orm/pg-core";
import { createTable } from "@/db/Kil";

const actionsEnum = pgEnum("song_profile_action", ["dislike", "like"]);

export const songProfileActions = createTable("song_profile_actions", {
  userId: varchar("user_id").notNull(),
  targetId: varchar("target_id").notNull(),
  action: actionsEnum("action").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SongProfileAction = InferSelectModel<typeof songProfileActions>;
