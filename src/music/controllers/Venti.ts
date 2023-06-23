import { Snowflake } from 'discord.js';

import {
  Player,
  PlayerUpdate,
  PlayOptions as ShoukakuPlayOptions,
  TrackStuckEvent,
  WebSocketClosedEvent
} from 'shoukaku';

import { Locale } from '../../i18n/i18n';
import { logger } from '../../modules/logger-transport';
import { Maybe } from '../../utils/type-guards';
import { Events, PlayerState, PlayOptions, VentiInitOptions } from '../interfaces/player.types';
import { ResolvableTrack } from '../structures/ResolvableTrack';
import { TrackQueue } from '../structures/TrackQueue';
import { Xiao, XiaoEvents } from './Xiao';

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
  public loop: LoopStates = LoopStates.NONE;

  /**
   * If the player is connected to a voice channel and playing.
   */
  public playing = false;

  /**
   * The player's state.
   */
  public state: PlayerState = PlayerState.CONNECTING;

  /**
   * Pause state of the player.
   */
  public paused = false;

  /**
   * Song queue.
   */
  public queue: TrackQueue;

  /**
   * The locale of the player.
   */
  public locale: Locale;

  constructor(xiao: Xiao, player: Player, options: VentiInitOptions) {
    this.xiao = xiao;
    this.options = options;
    this.instance = player;
    this.guildId = options.guild;
    this.voiceId = options.voiceChannel;
    this.locale = options.lang;

    this.queue = new TrackQueue();

    this.instance.on('start', () => {
      this.playing = true;
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
        this.emit(Events.TrackEnd, this, this.queue?.current);
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

  public async play(track?: ResolvableTrack, playOptions?: PlayOptions) {

    playOptions = {
      replace: false,
      ...playOptions
    };

    if (this.state === PlayerState.DESTROYED) {
      throw new Error('Player is destroyed');
    }

    if (!track && !this.queue.totalSize) {
      throw new Error('No track provided and queue is empty');
    }

    if (track && !playOptions.replace && this.queue.current) {
      logger.debug(`Queueing track ${track.title} for guild ${this.guildId}`);
      this.queue.unshift(this.queue.current);
    }

    if (this.queue.current) {
      this.queue.previous = new ResolvableTrack(this.queue.current.getRaw());
    }

    const nextTrack = track ?? this.queue.current ?? this.queue.shift();

    if (!nextTrack) {
      logger.debug(`No current track for guild ${this.guildId} - skipping play`);

      this.emit(Events.Debug, `No current track for guild ${this.guildId} - skipping play`);
      throw new Error('No track found');
    }

    if (!this.xiao.search) {
      throw new Error('No search provider found');
    }

    nextTrack.resolve().then(resolvedTrack => {
      this.queue.current = resolvedTrack;

      const shoukakuPlayOptions: ShoukakuPlayOptions = {
        track: resolvedTrack.track,
        options: {
          ...playOptions,
          noReplace: !playOptions?.replace
        }
      };

      logger.debug(`Playing track ${this.queue.current.title} for guild ${this.guildId} - ${this.queue.totalSize} tracks left in queue.`);
      this.instance.playTrack(shoukakuPlayOptions);
    }).catch((err) => {
      this.emit(Events.Debug, `Error while resolving track for guild ${this.guildId} - ${err}`);
      logger.error(`Error while resolving track for guild ${this.guildId} - ${err}`, err.stack);
      this.queue.length ? this.play() : this.emit(Events.QueueEmpty, this);
    });

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

    if (this.loop === LoopStates.TRACK) {
      this.loop = LoopStates.NONE;
    }

    this.queue.removeAt(0, amount - 1);

    logger.debug(`Skipping ${amount} tracks for guild ${this.guildId} - ${this.queue.totalSize} tracks left in queue.`);
    logger.debug(`Current track is ${this.queue.current?.title}`);
    logger.debug(`Next track will be ${this.queue[0]?.title}`);

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

    logger.debug(`Player for guild ${this.guildId} is now ${state ? 'paused' : 'playing'}`);
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
    };

    const newLoopState = loop || nextState[this.loop];

    this.loop = newLoopState;

    this.emit(Events.ManualUpdate, this, { components: true });
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