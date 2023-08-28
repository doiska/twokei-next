import { eq, sql } from "drizzle-orm";
import { pgSchema } from "drizzle-orm/pg-core";
import { songUserEvents } from "@/db/schemas/song-user-events";

export const songRanking = pgSchema("dev")
  .view("song_ranking")
  .as((qb) =>
    qb
      .select({
        userId: songUserEvents.userId,
        listened: sql<number>`COUNT(*)`.as("listened"),
        position: sql<number>`RANK() OVER (ORDER BY COUNT(*) DESC)`.as(
          "position",
        ),
      })
      .from(songUserEvents)
      .where(eq(songUserEvents.event, "heard_song"))
      .groupBy(songUserEvents.userId),
  );
