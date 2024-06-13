import { type User } from "discord.js";
import { type Track } from "@twokei/shoukaku";
import { playerLogger } from "@/lib/logger";

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

    playerLogger.error(`[ResolvableTrack] Track was not ready to play!`, {
      track: this.track,
    });

    throw new Error("Track not found");
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

  public static from(track: Track, options?: ResolvableTrackOptions) {
    return new ResolvableTrack(track, options);
  }
}
