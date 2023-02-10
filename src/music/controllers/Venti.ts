import { Xiao, XiaoEvents } from './Xiao';
import { Player, PlayerUpdate, Track, TrackStuckEvent, WebSocketClosedEvent } from 'shoukaku';
import { Events, VentiInitOptions, PlayerState, PlayOptions } from '../interfaces/player.types';
import { Snowflake } from 'discord.js';
import { Maybe } from '../../utils/utility-types';
import { TrackQueue } from '../managers/TrackQueue';
import { PlayOptions as ShoukakuPlayOptions } from 'shoukaku';
import { logger } from '../../modules/logger-transport';

export enum LoopStates {
  NONE = 'none',
  TRACK = 'track',
  QUEUE = 'queue'
}

// Player
export class Venti {

  /**
   * The Xiao instance.
   * @private
   */
  private readonly xiao: Xiao;

  /**
   * The player's options.
   * @private
   */
  private options: VentiInitOptions;

  /**
   * The Shoukaku Player instance.
   */
  public instance: Player;

  /**
   * The guild ID of the player.
   */
  public readonly guildId: Snowflake;

  /**
   * The voice channel id.
   */
  public voiceId: Maybe<Snowflake>;

  /**
   * Loop state of the player.
   */
  private loop: LoopStates = LoopStates.NONE;

  /**
   * If the player is connected to a voice channel and playing.
   */
  public playing: boolean = false;

  /**
   * The player's state.
   */
  public state: PlayerState = PlayerState.CONNECTING;

  /**
   * Pause state of the player.
   */
  public paused: boolean = false;

  /**
   * Song queue.
   */
  public queue: TrackQueue<Track>;

  constructor(xiao: Xiao, player: Player, options: VentiInitOptions) {
    this.xiao = xiao;
    this.options = options;
    this.instance = player;
    this.guildId = options.guild;
    this.voiceId = options.voiceChannel;

    this.queue = new TrackQueue<Track>(this);

    this.instance.on('start', () => {
      this.playing = true
      if (this.queue.current) {
        this.emit(Events.TrackStart, this, this.queue.current);
      }
    });

    this.instance.on('end', (data) => {
      if (this.state === PlayerState.DESTROYING || this.state === PlayerState.DESTROYED) {
        return this.emit(Events.Debug, `Player destroyed for guild ${this.guildId} - skipping end event`);
      }

      if (data.reason === 'REPLACED') {
        console.log(`Track replaced for guild ${this.guildId} - skipping end event`);
        this.emit(Events.TrackEnd, this, this.queue.current!);
        return;
      }

      if (['LOAD_FAILED', 'CLEAN_UP'].includes(data.reason)) {

        this.queue.previous = this.queue.current;
        this.playing = false;

        if (!this.queue.totalSize) {
          return this.emit(Events.QueueEmpty, this);
        }

        if (this.queue.current) {
          this.emit(Events.TrackEnd, this, this.queue.current);
        }

        this.queue.current = undefined;

        return this.play();
      }

      const currentSong = this.queue.current;

      if (this.queue.current) {
        if (this.loop === LoopStates.TRACK) {
          this.queue.unshift(this.queue.current);
        } else if (this.loop === LoopStates.QUEUE) {
          this.queue.push(this.queue.current);
        }
      }

      this.queue.previous = currentSong;
      this.queue.current = null;

      console.log(`Track ended for guild ${this.guildId} - ${this.queue.totalSize} tracks left in queue.`);
      console.log(`Current is null and previous is ${this.queue.previous?.info?.title}`)

      if (this.queue.length) {
        if (currentSong) {
          this.emit(Events.TrackEnd, this, currentSong);
        }
      } else {
        this.playing = false;
        return this.emit(Events.QueueEmpty, this);
      }

      return this.play();
    });

    this.instance.on('closed', (data: WebSocketClosedEvent) => {
      this.playing = false;
      this.emit(Events.PlayerClosed, this, data);
    });

    this.instance.on('exception', (error) => {
      this.playing = false;
      this.emit(Events.PlayerException, this, error);
    });

    this.instance.on('update', (data: PlayerUpdate) => this.emit(Events.PlayerUpdate, this, data));
    this.instance.on('stuck', (data: TrackStuckEvent) => this.emit(Events.PlayerStuck, this, data));
    this.instance.on('resumed', () => this.emit(Events.PlayerResumed, this));
  }

  public play(track?: Track, playOptions?: PlayOptions) {

    playOptions = {
      replace: false,
      ...playOptions
    }

    if (this.state === PlayerState.DESTROYED) {
      throw new Error('Player is destroyed');
    }

    if (!track && !this.queue.totalSize) {
      throw new Error('No track provided and queue is empty');
    }

    if (track && !playOptions.replace && this.queue.current) {
      logger.debug(`Queueing track ${track.info.title} for guild ${this.guildId}`);
      this.queue.unshift(this.queue.current);
    }

    if(this.queue.current) {
      this.queue.previous = { ...this.queue.current };
    }

    this.queue.current = track ?? this.queue.current ?? this.queue.shift();

    if (!this.queue.current) {
      logger.debug(`No current track for guild ${this.guildId} - skipping play`);

      this.emit(Events.Debug, `No current track for guild ${this.guildId} - skipping play`);
      throw new Error('No track found');
    }

    const shoukakuPlayOptions: ShoukakuPlayOptions = {
      track: this.queue.current.track,
      options: {
        ...playOptions,
        noReplace: !playOptions.replace
      }
    }

    logger.debug(`Playing track ${this.queue.current.info.title} for guild ${this.guildId} - ${this.queue.totalSize} tracks left in queue.`);

    this.instance.playTrack(shoukakuPlayOptions);
    return this;
  }

  /**
   * Skip the current track (or more) and play the next one.
   * @param amount
   */
  public async skip(amount = 1): Promise<Venti> {
    if (this.state === PlayerState.DESTROYED) {
      throw new Error('Player is destroyed');
    }

    if (this.queue.totalSize === 0) {
      throw new Error('Queue is empty');
    }

    if (amount < 1) {
      throw new Error('Invalid amount');
    }

    if (amount > this.queue.totalSize) {
      amount = this.queue.totalSize;
    }

    this.queue.removeAt(0, amount - 1);

    logger.info(`Skipping ${amount} tracks for guild ${this.guildId} - ${this.queue.totalSize} tracks left in queue.`);
    logger.info(`Current track is ${this.queue.current?.info?.title}`);
    logger.info(`Next track will be ${this.queue[0]?.info?.title}`);

    this.instance.stopTrack();
    return this;
  }


  public pause(state?: boolean) {
    if (typeof state !== 'boolean') {
      state = !this.paused;
    }

    if (this.paused === state) {
      return;
    }

    this.paused = state;
    this.instance.setPaused(state);
    this.playing = !state;

    logger.info(`Player for guild ${this.guildId} is now ${state ? 'paused' : 'playing'}`);
    this.emit(Events.TrackPause, this);


    return this.paused;
  }

  /**
   * Switch loop state.
   * @param loop
   */
  public setLoop(loop?: LoopStates) {
    if (this.state === PlayerState.DESTROYED) {
      throw new Error('Player is destroyed');
    }

    const nextState = {
      [LoopStates.NONE]: LoopStates.QUEUE,
      [LoopStates.QUEUE]: LoopStates.TRACK,
      [LoopStates.TRACK]: LoopStates.NONE
    }

    const newLoopState = loop || nextState[this.loop];

    this.loop = newLoopState;
    return newLoopState;
  }

  /**
   * Disconnects the player from the voice channel.
   */
  public disconnect() {
    if (this.state === PlayerState.DISCONNECTED || !this.voiceId) {
      throw new Error('Player is already disconnected');
    }

    this.state = PlayerState.DISCONNECTING;

    this.xiao.options.send(this.guildId, {
      op: 4,
      d: {
        guild_id: this.guildId,
        channel_id: null,
        self_deaf: false,
        self_mute: false
      }
    });

    this.voiceId = null;
    this.state = PlayerState.DISCONNECTED;

    this.emit(Events.Debug, `Player disconnected for guild ${this.guildId}`);

    return this;
  }

  /**
   * Destroy the player and remove it from the cache.
   */
  public destroy(): Venti {
    if (this.state === PlayerState.DESTROYING || this.state === PlayerState.DESTROYED) {
      throw new Error('Player is already destroyed');
    }

    this.disconnect();
    this.state = PlayerState.DESTROYING;

    this.instance.connection.disconnect();
    this.instance.removeAllListeners();

    this.state = PlayerState.DESTROYED;

    this.emit(Events.PlayerDestroy, this);
    this.emit(Events.Debug, `Player destroyed for guild ${this.guildId}`);

    return this;
  }

  /**
   * Set voice channel and move the player to the voice channel
   * @param voiceId Voice channel Id
   * @returns Venti
   */
  public setVoiceChannel(voiceId: Snowflake): Venti {
    if (this.state === PlayerState.DESTROYED) {
      throw new Error('Player is already destroyed');
    }

    this.state = PlayerState.CONNECTING;

    this.voiceId = voiceId;

    this.xiao.options.send(this.guildId, {
      op: 4,
      d: {
        guild_id: this.guildId,
        channel_id: this.voiceId,
        self_mute: false,
        self_deaf: this.options.deaf
      }
    });

    this.emit(Events.Debug, `Player ${this.guildId} moved to voice channel ${voiceId}`);

    return this;
  }

  public emit<U extends keyof XiaoEvents>(event: U, ...args: Parameters<XiaoEvents[U]>): boolean {
    return this.xiao.emit(event, ...args);
  }
}