import { type User } from "discord.js";
import { container } from "@sapphire/framework";
import { type Track } from "@twokei/shoukaku";

import { playerLogger } from "@/lib/logger";
import { cleanUpSong } from "@/music/utils/cleanup";
import { spotifyResolver } from "@/music/resolvers/spotify";

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
  public length?: number;

  /** Track's position (I don't know this) */
  public position?: number;

  /** Track's thumbnail, if available */
  public artworkUrl?: string;

  /** The YouTube/soundcloud URI for spotify and other unsupported source */
  public realUri?: string | null;

  public constructor(
    track: Omit<Track, "pluginInfo">,
    options?: ResolvableTrackOptions,
  ) {
    const { info } = track;

    this.requester = options?.requester;
    this.track = track.encoded;
    this.sourceName = info.sourceName ?? "Unknown";
    this.title = info.title;
    this.uri = info.uri;
    this.isrc = track.info.isrc;
    this.identifier = info.identifier;
    this.isSeekable = info.isSeekable;
    this.isStream = info.isStream;
    this.author = info.author;
    this.length = info.length;
    this.position = info.position;
    this.artworkUrl = track.info.artworkUrl;

    if (this.identifier && this.sourceName === "youtube") {
      this.artworkUrl = `https://img.youtube.com/vi/${this.identifier}/hqdefault.jpg`;
    }

    this.realUri = track.info.uri;
  }

  get isReadyToPlay(): boolean {
    const ready = {
      track: !!this.track,
      sourceName: !!this.sourceName,
      identifier: !!this.identifier,
      author: !!this.author,
      length: !!this.length,
      title: !!this.title,
      uri: !!this.uri,
      realUri: !!this.realUri,
    };

    const isReady = Object.values(ready).every((value) => value);

    playerLogger.debug(
      `[ResolvableTrack] Track is ${isReady ? "READY" : "NOT READY"} to play:`,
      {
        ...ready,
      },
    );

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

  public async resolve(): Promise<ResolvableTrack> {
    if (this.isReadyToPlay) {
      playerLogger.debug(`[ResolvableTrack] Track is already ready to play!`);
      return this;
    }

    const resolvedTrack = await this.getTrack();

    if (!resolvedTrack) {
      throw new Error("Track not found");
    }

    this.track = resolvedTrack.encoded;
    this.title = resolvedTrack.info.title;
    this.isSeekable = resolvedTrack.info.isSeekable;
    this.author = resolvedTrack.info.author;
    this.isStream = resolvedTrack.info.isStream;
    this.realUri = resolvedTrack.info.uri;
    this.length = resolvedTrack.info.length;

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
        length: this.length ?? 0,
        author: this.author ?? "",
        isStream: this.isStream,
        position: this.position ?? 0,
        sourceName: this.sourceName,
        isrc: this.isrc,
        artworkUrl: this.artworkUrl,
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
      playerLogger.debug(
        `[ResolvableTrack] Track already has ISRC: ${this.isrc}`,
      );

      return this.searchByISRC(this.isrc);
    }

    const spotifyResponse = await spotifyResolver.resolve(query);

    if (!spotifyResponse.tracks?.length) {
      return spotifyResponse;
    }

    const [track] = spotifyResponse.tracks;

    this.artworkUrl = track.artworkUrl;

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
    playerLogger.debug(`[ResolvableTrack] Searching by ISRC ${isrc}`);

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
        length: track.length ?? 0,
        position: track.position ?? 0,
      },
      pluginInfo: {},
    };
  }

  public static from(track: Track, options?: ResolvableTrackOptions) {
    return new ResolvableTrack(track, options);
  }
}
