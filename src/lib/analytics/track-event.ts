import {
  analyticsTrackInfo,
  analyticsUserAddedTracks,
  analyticsUserListenedTracks,
} from "@/db/schemas/analytics-track-info";
import { kil } from "@/db/Kil";
import { sql } from "drizzle-orm";
import { ResolvableTrack } from "@/music/structures/ResolvableTrack";

interface SongEvent {
  users: string[];
  event: "liked_song" | "disliked_song" | "added_song" | "heard_song";
  guild?: string;
  track: ResolvableTrack;
}

async function trackAddedSong(event: SongEvent) {
  await kil
    .insert(analyticsUserAddedTracks)
    .values(
      event.users.map((user) => ({
        userId: user,
        trackId: event.track.isrc!,
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

async function trackHeardSong(event: SongEvent) {
  await kil
    .insert(analyticsUserListenedTracks)
    .values(
      event.users.map((user) => ({
        userId: user,
        trackId: event.track.isrc!,
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
}

const track = {
  added_song: trackAddedSong,
  heard_song: trackHeardSong,
} as Record<SongEvent["event"], (event: SongEvent) => Promise<void>>;

export async function trackEvent(event: SongEvent) {
  if (!(event.event in track) || !event.track.isrc) {
    return;
  }

  await kil
    .insert(analyticsTrackInfo)
    .values({
      id: event.track.isrc,
      spotify_id: event.track.identifier,
      title: event.track.title,
      artists: event.track.author,
      durationInMs: event.track.length,
    })
    .onConflictDoNothing();

  await track[event.event](event);
}
