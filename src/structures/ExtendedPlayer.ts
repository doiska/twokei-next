import { Node, Player, Track, VoiceChannelOptions } from "shoukaku";

export class ExtendedPlayer extends Player {

  private _queue: Array<Track> = [];

  constructor(node: Node, options: VoiceChannelOptions) {
    super(node, options);
  }

  public async play(track: Track | string, skipCurrent = false): Promise<ExtendedPlayer> {

    const [playableTrack, ...rest] = typeof track === 'string' ? await this.resolveTrack(track) : [track];

    if(!playableTrack) {
      throw new Error('No track found');
    }

    if (this.playing && !skipCurrent) {
      console.log(`Adding track ${playableTrack} to queue`);
      this._queue.push(playableTrack, ...rest);
      return this;
    }

    if(rest.length) {
      this._queue = [...this._queue, ...rest];
    }

    if (this.playing) {
      await super.stopTrack();
    }

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

      console.log(`Playing next track ${nextTrack}`);
      return this.play(nextTrack, true);
    } else {
      console.log("stopping");
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

  public get queue(): Array<Track | string> {
    return this._queue;
  }

  private async resolveTrack(track: string): Promise<(Track)[]> {
    console.log(`Resolving track ${track}`);

    const { tracks, loadType } = await this.node.rest.resolve(track) || {};

    if (!loadType || !tracks || !tracks.length) {
      return [];
    }

    return loadType === 'PLAYLIST_LOADED' ? tracks : [tracks[0]]
  }
}