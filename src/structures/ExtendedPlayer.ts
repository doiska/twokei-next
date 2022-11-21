import { Node, Player, Track, VoiceChannelOptions } from "shoukaku";
import { logger } from "../utils/Logger";

export class ExtendedPlayer extends Player {

  private _queue: Array<Track> = [];
  private readonly _voiceChannelOptions: VoiceChannelOptions;

  constructor(node: Node, options: VoiceChannelOptions) {
    super(node, options);

    this._voiceChannelOptions = options;
  }

  public async play(track: Track | string, skipCurrent = false): Promise<ExtendedPlayer> {

    const [playableTrack, ...rest] = typeof track === 'string' ? await this.resolveTrack(track) : [track];

    if (!playableTrack) {
      throw new Error('No track found');
    }

    if (this.playing && !skipCurrent) {
      logger.verbose(`Adding track ${playableTrack} to queue`);
      this._queue.push(playableTrack, ...rest);
      return this;
    }

    if (rest.length) {
      this._queue = [...this._queue, ...rest];
    }

    if (this.playing) {
      await super.stopTrack();
    }

    logger.info(`Playing track ${playableTrack.info.uri}`);

    //TODO: make add on queue and remove after music ends
    this.queue.push(playableTrack);

    this.playTrack(playableTrack);
    return this;
  }

  public async next(amount?: number): Promise<ExtendedPlayer> {
    amount = amount || 1;

    if (amount > this._queue.length) {
      throw new Error("Queue is too short");
    }

    const nextTrack = this._queue[amount - 1];

    if (nextTrack) {
      this._queue = this._queue.slice(amount);

      logger.verbose(`Playing next track ${nextTrack}`);
      return this.play(nextTrack, true);
    } else {
      logger.verbose(`Queue is empty, stopping player`);
      return this.stop();
    }
  }

  public async stop(): Promise<ExtendedPlayer> {
    this._queue = [];

    await super.stopTrack();
    return this;
  }

  public async pause(): Promise<ExtendedPlayer> {
    await super.setPaused(!this.paused);
    return this;
  }

  public get playing(): boolean {
    return this.track !== null;
  }

  public get current(): string | null {
    return this.track;
  }

  public get voiceChannelOptions(): VoiceChannelOptions {
    return this._voiceChannelOptions;
  }

  public get queue(): Array<Track> {
    return this._queue;
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