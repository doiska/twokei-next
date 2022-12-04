import { Player, Track } from "shoukaku";
import { logger } from "../utils/Logger";
import { ExtendedQueue } from "./ExtendedQueue";

export enum AddSongResponse {
  SONG_ADDED,
  PLAYLIST_ADDED,
}

export enum PlaySongResponse {
  PLAYING,
  ALREADY_PLAYING,
  EMPTY_QUEUE
}

export class ExtendedPlayer extends Player {

  private _queue: ExtendedQueue<Track> = new ExtendedQueue();
  private _current: Track | null = null;

  public queueTime: number = 0;

  public async add(track: Track | string): Promise<AddSongResponse> {
    const songs = typeof track === 'string' ? await this.resolveTrack(track) : [track];

    if (!songs) {
      throw new Error('No track found');
    }

    this._queue.add(...songs);

    await this.play();

    return songs.length > 1 ? AddSongResponse.PLAYLIST_ADDED : AddSongResponse.SONG_ADDED;
  }

  public async play(skipCurrent = false): Promise<PlaySongResponse> {

    if(this.playing && !skipCurrent) {
      return PlaySongResponse.ALREADY_PLAYING;
    }

    const track = this._queue.first();

    if(!track) {
      return PlaySongResponse.EMPTY_QUEUE;
    }

    this._current = track;

    return PlaySongResponse.PLAYING;
  }

  public async next(): Promise<PlaySongResponse> {
    if (this._queue.isEmpty()) {
      throw PlaySongResponse.EMPTY_QUEUE;
    }

    return await this.play(true);
  }

  public stop(): Promise<ExtendedPlayer> {
    return new Promise(resolve => {
      this.leave();
      setTimeout(() => resolve(this), 1000);
    });
  }

  public leave(): ExtendedPlayer {
    this._queue.clear();
    this.node.leaveChannel(this.connection.guildId);
    return this;
  }

  public pause(): ExtendedPlayer {
    this.setPaused(!this.paused);
    return this;
  }

  public get playing(): boolean {
    return this._current !== null;
  }

  public get current(): Track | null {
    return this._current;
  }

  public get queue(): Array<Track> {
    return this._queue.entries();
  }

  private async resolveTrack(_track: string): Promise<(Track)[]> {

    const track = _track.startsWith('http') ? _track : `ytsearch:${_track}`;

    const { tracks, loadType } = await this.node.rest.resolve(track) || {};

    logger.verbose(`Resolving track ${track} with loadType ${loadType}`);

    if (!loadType || !tracks || !tracks.length) {
      return [];
    }

    return loadType === 'PLAYLIST_LOADED' ? tracks : [tracks[0]]
  }
}