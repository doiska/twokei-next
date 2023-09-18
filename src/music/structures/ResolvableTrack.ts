import { type User } from "discord.js";
import { container } from "@sapphire/framework";
import { type Track } from "shoukaku";

import { playerLogger } from "@/lib/logger";
import { spotifyTrackResolver } from "@/music/resolvers/spotify/spotify-track-resolver";
import { cleanUpSong } from "@/music/utils/cleanup";

interface ResolvableTrackOptions {
  requester?: User;
}

export class ResolvableTrack {
  /**
   * Track Requester
   */
  public requester?: User;

  /** Track's Base64 */
  public track: string;

  /** Track's source */
  public sourceName: string;

  /** Track's title */
  public title: string;

  /** Track's URI */
  public uri?: string;

  /**
   * Track International Recording
   */
  public isrc?: string;

  /** Track's identifier */
  public identifier: string;

  /** Whether the track is seekable */
  public isSeekable: boolean;

  /** Whether the track is a stream */
  public isStream: boolean;

  /** Track's author */
  public author?: string;

  /** Track's length */
  public duration?: number;

  /** Track's position (I don't know this) */
  public position?: number;

  /** Track's thumbnail, if available */
  public thumbnail?: string;

  /** The YouTube/soundcloud URI for spotify and other unsupported source */
  public realUri?: string | null;

  public constructor(
    track: Omit<Track, "pluginInfo"> & { thumbnail?: string; isrc?: string },
    options?: ResolvableTrackOptions,
  ) {
    const { info } = track;

    this.requester = options?.requester;
    this.track = track.encoded;
    this.sourceName = info.sourceName ?? "Unknown";
    this.title = info.title;
    this.uri = info.uri;
    this.isrc = track.isrc;
    this.identifier = info.identifier;
    this.isSeekable = info.isSeekable;
    this.isStream = info.isStream;
    this.author = info.author;
    this.duration = info.duration;
    this.position = info.position;

    if (this.identifier && this.sourceName === "youtube") {
      this.thumbnail = `https://img.youtube.com/vi/${this.identifier}/hqdefault.jpg`;
    }

    this.thumbnail = track.thumbnail;
    this.realUri = ["youtube"].includes(this.sourceName) ? this.uri : null;
  }

  get isReadyToPlay(): boolean {
    return (
      !!this.track &&
      !!this.sourceName &&
      !!this.identifier &&
      !!this.author &&
      !!this.duration &&
      !!this.title &&
      !!this.uri &&
      !!this.realUri
    );
  }

  public async resolve(overwrite = false): Promise<ResolvableTrack> {
    if (this.isReadyToPlay) {
      return this;
    }

    const resolvedTrack = await this.getTrack();

    if (!resolvedTrack) {
      throw new Error("Track not found");
    }

    this.track = resolvedTrack.encoded;
    this.realUri = resolvedTrack.info.uri;
    this.duration = resolvedTrack.info.duration;

    if (overwrite) {
      this.title = resolvedTrack.info.title;
      this.isSeekable = resolvedTrack.info.isSeekable;
      this.author = resolvedTrack.info.author;
      this.duration = resolvedTrack.info.duration;
      this.isStream = resolvedTrack.info.isStream;
    }

    return this;
  }

  public getRaw(): Track {
    return {
      encoded: this.track,
      info: {
        identifier: this.identifier,
        isSeekable: this.isSeekable,
        uri: this.uri,
        title: this.title,
        duration: this.duration ?? 0,
        author: this.author ?? "",
        isStream: this.isStream,
        position: this.position ?? 0,
        sourceName: this.sourceName,
      },
      pluginInfo: {},
    };
  }

  private async getTrack() {
    const query = cleanUpSong(this.title, this.author);
    const response = await this.resolveQuery(query);

    if (!response?.tracks?.length) {
      return;
    }

    playerLogger.info(`[ResolvableTrack] Get Track resolved ${query}`);

    const [resolved] = response.tracks;

    if (!this.isrc) {
      playerLogger.debug("[ResolvableTrack] Track does not have ISRC yet.");
    } else {
      playerLogger.debug(
        `[ResolvableTrack] Track has ISRC, checking if it matches.`,
      );
    }

    if (!this.isrc && resolved.isrc) {
      playerLogger.debug("[ResolvableTrack] Track has ISRC, using it.");
      this.isrc = resolved.isrc;
    }

    return this.parseResolvableToTrack(resolved);
  }

  private async resolveQuery(query: string) {
    if (this.isrc) {
      return this.searchByISRC(this.isrc);
    }

    const spotifyResponse = await spotifyTrackResolver.resolve(query, {
      requester: this.requester,
    });

    if (!spotifyResponse.tracks?.length) {
      return spotifyResponse;
    }

    const [track] = spotifyResponse.tracks;

    this.thumbnail = track.thumbnail;

    if (!track.isrc) {
      const newSearchQuery = cleanUpSong(track.title, track.author);
      playerLogger.debug(
        `[ResolvableTrack] Track does not have ISRC, using search for ${newSearchQuery}`,
      );

      return this.searchByQuery(newSearchQuery);
    }

    playerLogger.debug(
      `[ResolvableTrack] Resolved ${query} (ISRC: ${track.isrc}) in Spotify`,
    );

    this.isrc = track.isrc;

    return this.searchByISRC(track.isrc);
  }

  private searchByISRC(isrc: string) {
    return container.xiao.search(isrc, {
      engine: "dzisrc",
      requester: this.requester,
    });
  }

  private searchByQuery(query: string) {
    return container.xiao.search(query, {
      requester: this.requester,
    });
  }

  private parseResolvableToTrack(resolvable: Track | ResolvableTrack): Track {
    if ((resolvable as Track).info) {
      return resolvable as Track;
    }

    const track = resolvable as ResolvableTrack;

    return {
      encoded: track.track,
      info: {
        isSeekable: track.isSeekable,
        isStream: track.isStream,
        title: track.title,
        uri: track.uri,
        identifier: track.identifier,
        sourceName: track.sourceName,
        author: track.author ?? "",
        duration: track.duration ?? 0,
        position: track.position ?? 0,
      },
      pluginInfo: {},
    };
  }

  public short() {
    const source = ["youtube", "spotify", "deezer"].includes(
      this.sourceName.toLowerCase(),
    )
      ? (this.sourceName as "youtube" | "spotify" | "deezer")
      : "spotify";

    return {
      title: this.title,
      author: this.author,
      uri: this.uri,
      isrc: this.isrc,
      source: source,
    };
  }
}
