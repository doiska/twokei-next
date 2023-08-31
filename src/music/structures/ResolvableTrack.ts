import { type User } from "discord.js";
import { container } from "@sapphire/framework";
import { type Track } from "shoukaku";

import { logger, playerLogger } from "@/modules/logger-transport";
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
  public uri: string;

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
  public length?: number;

  /** Track's position (I don't know this) */
  public position?: number;

  /** Track's thumbnail, if available */
  public thumbnail?: string;

  /** The YouTube/soundcloud URI for spotify and other unsupported source */
  public realUri: string | null;

  public constructor(
    track: Track & { thumbnail?: string; isrc?: string },
    options?: ResolvableTrackOptions,
  ) {
    const { info } = track;

    this.requester = options?.requester;
    this.track = track.track;
    this.sourceName = info.sourceName;
    this.title = info.title;
    this.uri = info.uri;
    this.isrc = track.isrc;
    this.identifier = info.identifier;
    this.isSeekable = info.isSeekable;
    this.isStream = info.isStream;
    this.author = info.author;
    this.length = info.length;
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
      !!this.length &&
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

    this.track = resolvedTrack.track;
    this.realUri = resolvedTrack.info.uri;
    this.length = resolvedTrack.info.length;

    if (overwrite) {
      this.title = resolvedTrack.info.title;
      this.isSeekable = resolvedTrack.info.isSeekable;
      this.author = resolvedTrack.info.author;
      this.length = resolvedTrack.info.length;
      this.isStream = resolvedTrack.info.isStream;
    }

    return this;
  }

  public getRaw(): Track {
    return {
      track: this.track,
      info: {
        identifier: this.identifier,
        isSeekable: this.isSeekable,
        uri: this.uri,
        title: this.title,
        length: this.length ?? 0,
        author: this.author ?? "",
        isStream: this.isStream,
        position: this.position ?? 0,
        sourceName: this.sourceName,
      },
    };
  }

  private async getTrack() {
    const query = cleanUpSong(this.title, this.author);

    const response = await this.resolveQuery(query);

    playerLogger.info(`[ResolvableTrack] Get Track resolved ${query} into `, {
      response,
    });

    if (!response?.tracks.length) {
      return;
    }

    const [track] = response.tracks.map(this.parseResolvableToTrack);

    return track;
  }

  // TODO: refactor and cleanup
  private async resolveQuery(query: string) {
    if (this.isrc) {
      logger.debug("[TRACK] Already has ISRC");
      return container.xiao.search(this.isrc, {
        engine: "dzisrc",
        requester: this.requester,
      });
    }

    const spotifyResponse = await spotifyTrackResolver.resolve(query, {
      requester: this.requester,
    });

    if (!spotifyResponse.tracks.length) {
      return spotifyResponse;
    }

    const [track] = spotifyResponse.tracks;

    if (!track.isrc) {
      const newSearchQuery = cleanUpSong(track.title, track.author);
      playerLogger.debug(
        `[ResolvableTrack] Track does not have ISRC, using search for ${newSearchQuery}`,
      );

      return container.xiao.search(newSearchQuery, {
        requester: this.requester,
      });
    }

    playerLogger.debug(
      `[Resolvable Track] Resolved ${query} (ISRC: ${
        track?.isrc ?? ""
      }) in Spotify`,
    );

    return container.xiao.search(track.isrc, {
      engine: "dzisrc",
      requester: this.requester,
    });
  }

  private parseResolvableToTrack(resolvable: Track | ResolvableTrack): Track {
    if ((resolvable as Track).info) {
      return resolvable as Track;
    }

    const track = resolvable as ResolvableTrack;

    return {
      track: track.track,
      info: {
        isSeekable: track.isSeekable,
        isStream: track.isStream,
        title: track.title,
        uri: track.uri,
        identifier: track.identifier,
        sourceName: track.sourceName,
        author: track.author ?? "",
        length: track.length ?? 0,
        position: track.position ?? 0,
      },
    };
  }

  public short() {
    return {
      title: this.title,
      source: {
        name: this.sourceName,
        uri: this.uri,
      },
      uri: this.realUri,
      author: this.author,
      duration: this.length,
    };
  }
}
