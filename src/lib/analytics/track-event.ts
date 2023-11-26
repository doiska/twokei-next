import {
  analyticsUserAddedTracks,
  analyticsUserListenedTracks,
} from "@/db/schemas/analytics-track-info";
import { kil } from "@/db/Kil";
import { sql } from "drizzle-orm";

interface SongEvent {
  users: string[];
  event: "liked_song" | "disliked_song" | "added_song" | "heard_song";
  guild?: string;
  track: {
    isrc: string;
  };
}

export async function trackEvent(event: SongEvent) {
  if (event.event === "heard_song") {
    await kil
      .insert(analyticsUserListenedTracks)
      .values(
        event.users.map((user) => ({
          userId: user,
          trackId: event.track.isrc,
          guildId: event.guild,
          listened: 1,
        })),
      )
      .onConflictDoUpdate({
        set: {
          listened: sql`${analyticsUserListenedTracks.listened} + 1`,
        },
        target: [
          analyticsUserListenedTracks.userId,
          analyticsUserListenedTracks.trackId,
          analyticsUserListenedTracks.guildId,
        ],
      });

    return;
  }

  if (event.event === "added_song") {
    await kil
      .insert(analyticsUserAddedTracks)
      .values(
        event.users.map((user) => ({
          userId: user,
          trackId: event.track.isrc,
          guildId: event.guild,
          listened: 1,
        })),
      )
      .onConflictDoUpdate({
        set: {
          listened: sql`${analyticsUserAddedTracks.listened} + 1`,
        },
        target: [
          analyticsUserAddedTracks.userId,
          analyticsUserAddedTracks.trackId,
          analyticsUserAddedTracks.guildId,
        ],
      });
  }
}
