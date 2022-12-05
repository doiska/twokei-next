import { Xiao, XiaoEvents } from "../Xiao";
import { Player, PlayerUpdate, Track, TrackStuckEvent, WebSocketClosedEvent } from "shoukaku";
import { Events, KazuInitOptions, PlayerState, PlayOptions } from "../interfaces/player.types";
import { Snowflake } from "discord.js";
import { Maybe } from "../../utils/utils.types";
import { ExtendedQueue } from "../../structures/ExtendedQueue";

export enum LoopStates {
  NONE,
  TRACK,
  QUEUE
}

// Player
export class Kazu {

  /**
   * The Xiao instance.
   * @private
   */
  private readonly xiao: Xiao;

  /**
   * The player's options.
   * @private
   */
  private options: KazuInitOptions;

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

  public queue: ExtendedQueue<Track>;

  constructor(xiao: Xiao, player: Player, options: KazuInitOptions) {
    this.xiao = xiao;
    this.options = options;
    this.instance = player;
    this.guildId = options.guild;
    this.voiceId = options.channel;

    this.queue = new ExtendedQueue<Track>();

    this.instance.on('start', () => {
      this.playing = true
      if (this.queue.current) {
        this.emit(Events.TrackStart, this, this.queue.current);
      }
    });

    this.instance.on('end', (data) => {
      if (this.state === PlayerState.DESTROYING || this.state === PlayerState.DESTROYED) {
        this.emit(Events.Debug, `Player destroyed for guild ${this.guildId} - skipping end event`);
        return;
      }

      if (data.reason === 'REPLACED') {
        this.emit(Events.TrackEnd, this, this.queue.current!);
        return;
      }

      if (['LOAD_FAILED', 'CLEAN_UP'].includes(data.reason)) {
        this.playing = false;

        if (!this.queue.totalSize) {
          return this.emit(Events.QueueEmpty, this);
        }

        if (this.queue.current) {
          this.emit(Events.TrackEnd, this, this.queue.current);
        }

        this.queue.current = null;
        return this.play();
      }

      if (this.queue.current) {
        if (this.loop === LoopStates.TRACK || this.loop === LoopStates.QUEUE) {
          this.queue.add(this.queue.current);
        }
      }

      const currentSong = this.queue.current;

      this.queue.previous = currentSong;
      this.queue.current = null;

      if (this.queue.totalSize && currentSong) {
        this.emit(Events.TrackEnd, this, currentSong);
      } else if (!this.queue.totalSize) {
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
      replaceCurrent: false,
      ...playOptions
    }

    if (this.state === PlayerState.DESTROYED) {
      throw new Error('Player is destroyed');
    }

    if (!track && !this.queue.totalSize) {
      throw new Error('No track provided and queue is empty');
    }

    if (track) {
      if (!playOptions.replaceCurrent && this.queue.current) {
        this.queue.unshift(track);
      }
    } else if (!this.queue.current) {
      this.queue.current = this.queue.shift();
    }

    if (!this.queue.current) {
      this.emit(Events.Debug, `No current track for guild ${this.guildId} - skipping play`);
      throw new Error('No track found');
    }

    this.instance.playTrack(this.queue.current);
    return this;
  }

  /**
   * Skip the current track (or more) and play the next one.
   * @param amount
   */
  public async skip(amount = 1): Promise<Kazu> {
    if (this.state === PlayerState.DESTROYED) {
      throw new Error('Player is destroyed');
    }

    if (amount > this.queue.totalSize) {
      throw new Error('Cannot skip more than the queue size');
    }

    console.log(`Total size: ${this.queue.totalSize} - Amount: ${amount}`);

    if (amount > 1) {
      this.queue.removeAt(0, amount - 1);
    }

    this.instance.stopTrack();
    return this;
  }


  public connect() {
    if (this.state === PlayerState.DESTROYED) {
      throw new Error('Player is destroyed');
    }

    if (this.state === PlayerState.CONNECTED || !!this.voiceId) {
      throw new Error('Player is already connected');
    }

    this.state = PlayerState.CONNECTING;

    this.xiao.options.send(this.guildId, {
      op: 4,
      d: {
        guild_id: this.guildId,
        channel_id: this.voiceId,
        self_mute: this.options.mute || false,
        self_deaf: this.options.deaf || true,
      }
    });

    this.state = PlayerState.CONNECTED;

    this.emit(Events.Debug, `Player connected for guild ${this.guildId}`);

    return this;
  }

  /**
   * Switch loop state.
   * @param loop
   */
  public setLoop(loop?: LoopStates) {
    if (this.state === PlayerState.DESTROYED) {
      throw new Error('Player is destroyed');
    }

    const relatedLoop = {
      [LoopStates.NONE]: LoopStates.QUEUE,
      [LoopStates.QUEUE]: LoopStates.TRACK,
      [LoopStates.TRACK]: LoopStates.NONE
    }

    const newLoopState = loop || relatedLoop[this.loop];

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
  public destroy(): Kazu {
    if (this.state === PlayerState.DESTROYING || this.state === PlayerState.DESTROYED) {
      throw new Error('Player is already destroyed');
    }

    this.disconnect();
    this.state = PlayerState.DESTROYING;

    this.instance.connection.disconnect();
    this.instance.removeAllListeners();

    this.xiao.players.delete(this.guildId);
    this.state = PlayerState.DESTROYED;

    this.emit(Events.PlayerDestroy, this);
    this.emit(Events.Debug, `Player destroyed for guild ${this.guildId}`);

    return this;
  }

  /**
   * Set voice channel and move the player to the voice channel
   * @param voiceId Voice channel Id
   * @returns Kazu
   */
  public setVoiceChannel(voiceId: Snowflake): Kazu {
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
        self_deaf: this.options.deaf,
      },
    });

    this.emit(Events.Debug, `Player ${this.guildId} moved to voice channel ${voiceId}`);

    return this;
  }

  public emit<U extends keyof XiaoEvents>(event: U, ...args: Parameters<XiaoEvents[U]>): boolean {
    return this.xiao.emit(event, ...args);
  }
}