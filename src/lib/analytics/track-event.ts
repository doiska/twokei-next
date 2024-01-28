import {
  analyticsTrackInfo,
  analyticsUserAddedTracks,
  analyticsUserListenedTracks,
} from "@/db/schemas/analytics-track-info";
import { kil } from "@/db/Kil";
import { sql } from "drizzle-orm";
import { ResolvableTrack } from "@/music/structures/ResolvableTrack";
import { logger } from "@/lib/logger";
import { User } from "discord.js";
import { coreUsers } from "@/db/schemas/core-users";

interface SongEvent {
  users: User[];
  event: "liked_song" | "disliked_song" | "added_song" | "heard_song";
  tracks: ResolvableTrack[];
  guild?: string;
}

async function trackAddedSong(event: SongEvent) {
  const validTracks = event.tracks.filter(
    (track) => track.isrc && track.requester,
  );

  if (!validTracks.length) {
    return;
  }

  await kil
    .insert(analyticsUserAddedTracks)
    .values(
      validTracks.map((track) => ({
        userId: track.requester!.id,
        trackId: track.isrc!,
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
  for (const user of event.users) {
    await kil
      .insert(analyticsUserListenedTracks)
      .values(
        event.tracks.map((track) => ({
          userId: user.id,
          trackId: track.isrc!,
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
}

const track = {
  added_song: trackAddedSong,
  heard_song: trackHeardSong,
} as Record<SongEvent["event"], (event: SongEvent) => Promise<void>>;

//TODO: improve tracking, added tracks doesnt make sense
export async function trackEvent(event: SongEvent) {
  if (!(event.event in track)) {
    return;
  }

  try {
    await kil
      .insert(coreUsers)
      .values(
        event.users.map((user) => ({
          id: user.id,
          name: user.username,
          updatedAt: sql`NOW()`,
        })),
      )
      .onConflictDoNothing();

    const insertInfo = event.tracks
      .filter((track) => !!track.isrc)
      .map((track) => ({
        id: track.isrc!,
        spotify_id: track.identifier,
        title: track.title,
        artists: track.author,
        durationInMs: track.length,
      }));

    await kil
      .insert(analyticsTrackInfo)
      .values(insertInfo)
      .onConflictDoNothing();

    await track[event.event](event);
  } catch (error) {
    logger.error(`Error while tracking event ${event.event}`, error);
  }
}
