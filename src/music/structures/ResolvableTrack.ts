import { type User } from 'discord.js';
import { container } from '@sapphire/framework';
import { noop } from '@sapphire/utilities';
import { type Track } from 'shoukaku';

import { sortBySimilarity } from '@/utils/string-distance';

interface ResolvableTrackOptions {
  requester?: User
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

  public constructor (
    track: Track & { thumbnail?: string },
    options?: ResolvableTrackOptions,
  ) {
    const { info } = track;

    this.requester = options?.requester;
    this.track = track.track;
    this.sourceName = info.sourceName;
    this.title = info.title;
    this.uri = info.uri;
    this.identifier = info.identifier;
    this.isSeekable = info.isSeekable;
    this.isStream = info.isStream;
    this.author = info.author;
    this.length = info.length;
    this.position = info.position;

    if (this.identifier && this.sourceName === 'youtube') {
      this.thumbnail = `https://img.youtube.com/vi/${this.identifier}/hqdefault.jpg`;
    }

    this.thumbnail = track.thumbnail;
    this.realUri = ['youtube'].includes(this.sourceName) ? this.uri : null;
  }

  get isReadyToPlay (): boolean {
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

  public async resolve (overwrite = false): Promise<ResolvableTrack> {
    if (this.isReadyToPlay) {
      return this;
    }

    const resolvedTrack = await this.getTrack();

    if (!resolvedTrack) {
      throw new Error('Track not found');
    }

    this.track = resolvedTrack.track;
    this.realUri = resolvedTrack.info.uri;
    this.length = resolvedTrack.info.length;

    if (overwrite) {
      this.title = resolvedTrack.info.title;
      this.identifier = resolvedTrack.info.identifier;
      this.isSeekable = resolvedTrack.info.isSeekable;
      this.author = resolvedTrack.info.author;
      this.length = resolvedTrack.info.length;
      this.isStream = resolvedTrack.info.isStream;
      this.uri = resolvedTrack.info.uri;
    }

    return this;
  }

  public getRaw (): Track {
    return {
      track: this.track,
      info: {
        identifier: this.identifier,
        isSeekable: this.isSeekable,
        uri: this.uri,
        title: this.title,
        length: this.length ?? 0,
        author: this.author ?? '',
        isStream: this.isStream,
        position: this.position ?? 0,
        sourceName: this.sourceName,
      },
    };
  }

  private async getTrack () {
    const query = [this.cleanUpTitle(this.title), this.cleanUpAuthor(this.author ?? '')].filter(Boolean).join(' - ');

    console.log(`Searching getTrack: ${query}`);

    const response = await container.xiao.search(query, {
      requester: this.requester,
      engine: 'dz',
    }).catch(noop);

    if (!response?.tracks.length) {
      return;
    }

    const tracks = response.tracks.map(this.parseResolvableToTrack);

    const titles = tracks.map(track => track.info.title);

    const [mostSimilarTitle] = sortBySimilarity(titles, this.title);

    console.log(`Most similar title to ${this.title} is ${mostSimilarTitle}`);

    return tracks.find(t => t.info.title === mostSimilarTitle) ?? tracks[0];
  }

  private parseResolvableToTrack (resolvable: Track | ResolvableTrack): Track {
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
        author: track.author ?? '',
        length: track.length ?? 0,
        position: track.position ?? 0,
      },
    };
  }

  public short () {
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

  private cleanUpTitle (str: string) {
    const words = ['music', 'video', 'lyrics', 'vevo', 'topic'];

    return str
      .replaceAll(/[^a-z0-9]/gi, ' ')
      .split(' ')
      .map(word => word.trim())
      .filter((w) => !words.includes(w.toLowerCase()))
      .join(' ');
  }

  private cleanUpAuthor (str: string) {
    const words = ['vevo', 'topic', 'lyrics'];

    return str
      .replaceAll(/[^a-z0-9]/gi, ' ')
      .split(' ')
      .map(word => word.trim())
      .filter((w) => !words.includes(w.toLowerCase()))
      .join(' ');
  }
}
