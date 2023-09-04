import { type Guild, type Message, type Snowflake } from "discord.js";
import {
  type Player,
  type PlayerUpdate,
  type PlayOptions as ShoukakuPlayOptions,
  type TrackStuckEvent,
  type WebSocketClosedEvent,
} from "shoukaku";

import { type Locale } from "@/locales/i18n";
import { createLogger, playerLogger } from "@/modules/logger-transport";
import {
  Events,
  PlayerState,
  type PlayOptions,
  type VentiInitOptions,
} from "../interfaces/player.types";
import { ResolvableTrack } from "../structures/ResolvableTrack";
import { TrackQueue } from "../structures/TrackQueue";
import type { Xiao, XiaoEvents } from "./Xiao";

import { inspect } from "node:util";
import type { Logger } from "winston";
import type { Maybe } from "@/utils/types-helper";

export enum LoopStates {
  NONE = "none",
  TRACK = "track",
  QUEUE = "queue",
}

// Player
export class Venti {
  /**
   * The Shoukaku Player instance.
   */
  public instance: Player;

  /**
   * The guild ID of the player.
   */
  public readonly guild: Guild;

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

  /**
   * The Xiao instance.
   * @private
   */
  private readonly xiao: Xiao;

  /**
   * The SongChannel embed message.
   * @private
   */
  public embedMessage?: Message;

  private readonly logger: Logger;

  constructor(xiao: Xiao, player: Player, options: VentiInitOptions) {
    this.xiao = xiao;
    this.instance = player;
    this.guild = options.guild;
    this.guildId = options.guild.id;
    this.voiceId = options.voiceChannel;
    this.locale = options.lang;
    this.embedMessage = options.embedMessage;

    this.queue = new TrackQueue();

    this.logger = createLogger("Venti");

    this.instance.on("start", () => {
      this.playing = true;
      if (this.queue.current) {
        this.emit(Events.TrackStart, this, this.queue.current);
      }
    });

    this.instance.on("end", (data) => {
      if (
        this.state === PlayerState.DESTROYING ||
        this.state === PlayerState.DESTROYED
      ) {
        this.emit(
          Events.Debug,
          `Player destroyed for guild ${this.guildId} - skipping end event`,
        );
        return;
      }

      if (data.reason === "REPLACED") {
        this.emit(Events.TrackEnd, this, this.queue?.current, "Replaced");
        return;
      }

      if (["LOAD_FAILED", "CLEAN_UP"].includes(data.reason)) {
        this.queue.previous = this.queue.current;
        this.playing = false;

        playerLogger.info("Track ended with reason LOAD_FAILED or CLEAN_UP", {
          reason: data.reason,
          guild: this.guildId,
          track: this.queue?.current?.title,
        });

        if (!this.queue.totalSize) {
          this.emit(Events.QueueEmpty, this);
          return;
        }

        if (this.queue.current) {
          this.emit(Events.TrackEnd, this, this.queue.current, "Error");
        }

        this.queue.current = undefined;

        void this.play();
        return;
      }

      const currentSong = this.queue.current;

      if (this.queue.current) {
        if (this.loop === LoopStates.TRACK) {
          this.queue.unshift(this.queue.current);
        } else if (this.loop === LoopStates.QUEUE) {
          this.queue.push(this.queue.current);
        }
      }

      if (currentSong) {
        this.emit(Events.TrackEnd, this, currentSong, "Ended");
      }

      this.queue.previous = currentSong;
      this.queue.current = null;

      if (!this.queue.length) {
        this.playing = false;
        this.emit(Events.QueueEmpty, this);
        return;
      }

      void this.play();
    });

    this.instance.on("closed", (data: WebSocketClosedEvent) => {
      this.playing = false;
      this.emit(Events.PlayerClosed, this, data);
    });

    this.instance.on("exception", (error) => {
      this.playing = false;
      this.emit(Events.PlayerException, this, error);
    });

    this.instance.on("update", (data: PlayerUpdate) =>
      this.emit(Events.PlayerUpdate, this, data),
    );
    this.instance.on("stuck", (data: TrackStuckEvent) =>
      this.emit(Events.PlayerStuck, this, data),
    );
    this.instance.on("resumed", () => this.emit(Events.PlayerResumed, this));
  }

  public async play(track?: ResolvableTrack, userPlayOptions?: PlayOptions) {
    const playOptions = {
      replace: false,
      ...userPlayOptions,
    };

    if (this.state === PlayerState.DESTROYED) {
      throw new Error("Player is destroyed");
    }

    if (!track && !this.queue.totalSize) {
      throw new Error("No track provided and queue is empty");
    }

    if (track && !playOptions.replace && this.queue.current) {
      this.logger.debug(
        `Queueing track ${track.title} for guild ${this.guildId}`,
      );
      this.queue.unshift(this.queue.current);
    }

    if (this.queue.current) {
      this.queue.previous = new ResolvableTrack(this.queue.current.getRaw());
    }

    const nextTrack = track ?? this.queue.current ?? this.queue.shift();

    if (!nextTrack) {
      this.logger.debug(
        `No current track for guild ${this.guildId} - skipping play`,
      );

      this.emit(
        Events.Debug,
        `No current track for guild ${this.guildId} - skipping play`,
      );
      throw new Error("No track found");
    }

    if (!this.xiao.search) {
      throw new Error("No search provider found");
    }

    nextTrack
      .resolve(true)
      .then((resolvedTrack) => {
        this.queue.current = resolvedTrack;

        const shoukakuPlayOptions: ShoukakuPlayOptions = {
          track: resolvedTrack.track,
          options: {
            ...playOptions,
            noReplace: !playOptions?.replace,
          },
        };

        this.logger.debug(
          `Playing track ${this.queue.current.title} for guild ${this.guildId} - ${this.queue.totalSize} tracks left in queue.`,
        );

        this.instance.playTrack(shoukakuPlayOptions);
      })
      .catch((err: Error) => {
        this.emit(
          Events.Debug,
          `Error while resolving track for guild ${this.guildId}} ${err.message}`,
        );

        this.logger.error(
          `Error while resolving track for guild ${this.guildId} - ${err.message}`,
          err.stack,
        );

        if (this.queue.length) {
          void this.play();
        } else {
          this.emit(Events.QueueEmpty, this);
        }
      });
    return this;
  }

  /**
   * Skip the current track (or more) and play the next one.
   * @param amount
   */
  public async skip(amount = 1): Promise<Venti> {
    if (this.state === PlayerState.DESTROYED) {
      throw new Error("Player is destroyed");
    }

    if (this.queue.totalSize === 0) {
      throw new Error("Queue is empty");
    }

    if (amount < 1) {
      throw new Error("Invalid amount");
    }

    if (amount > this.queue.totalSize) {
      // eslint-disable-next-line no-param-reassign
      amount = this.queue.totalSize;
    }

    this.setLoop(LoopStates.NONE);

    this.queue.removeAt(0, amount - 1);

    this.logger.debug(
      `Skipping ${amount} tracks for guild ${this.guildId} - ${this.queue.totalSize} tracks left in queue.`,
    );

    this.logger.debug(`Current track: ${this.queue.current?.title ?? "none"}`);
    this.logger.debug(`Next track: ${this.queue[0]?.title ?? "none"}`);

    this.instance.stopTrack();
    return this;
  }

  public pause(state?: boolean) {
    if (typeof state !== "boolean") {
      state = !this.paused;
    }

    if (this.paused === state) {
      return;
    }

    this.paused = state;
    this.playing = !state;
    this.instance.setPaused(state);

    this.logger.debug(
      `Player for guild ${this.guildId} is now ${state ? "paused" : "playing"}`,
    );

    this.emit(Events.TrackPause, this);

    return this.paused;
  }

  /**
   * Switch loop state.
   * @param loop
   */
  public setLoop(loop?: LoopStates) {
    if (this.state === PlayerState.DESTROYED) {
      throw new Error("Player is destroyed");
    }

    const nextState = {
      [LoopStates.NONE]: LoopStates.QUEUE,
      [LoopStates.QUEUE]: LoopStates.TRACK,
      [LoopStates.TRACK]: LoopStates.NONE,
    };

    const newLoopState = loop ?? nextState[this.loop];

    this.loop = newLoopState;

    this.emit(Events.ManualUpdate, this, { components: true });
    return newLoopState;
  }

  /**
   * Disconnects the player from the voice channel.
   */
  public disconnect() {
    if (this.state === PlayerState.DISCONNECTED || !this.voiceId) {
      throw new Error("Player is already disconnected");
    }

    this.state = PlayerState.DISCONNECTING;

    this.xiao.options.send(this.guildId, {
      op: 4,
      d: {
        guild_id: this.guildId,
        channel_id: null,
        self_deaf: false,
        self_mute: false,
      },
    });

    this.voiceId = null;
    this.state = PlayerState.DISCONNECTED;

    this.emit(Events.Debug, `Player disconnected for guild ${this.guildId}`);

    return this;
  }

  /**
   * Destroy the player and remove it from the cache.
   */
  public destroy() {
    if (
      this.state === PlayerState.DESTROYING ||
      this.state === PlayerState.DESTROYED
    ) {
      throw new Error("Player is already destroyed");
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

  public emit<U extends keyof XiaoEvents>(
    event: U,
    ...args: Parameters<XiaoEvents[U]>
  ): boolean {
    if (event !== "playerUpdate") {
      if (args?.[0] instanceof Venti) {
        const { instance } = args[0];

        this.logger.silly("[Venti] Instance info", {
          node: {
            name: instance.node.name,
            url: instance.node.stats,
          },
          rest: instance.ping,
          connection: instance.connection.state,
        });
      }

      this.logger.silly(
        `[Venti] Emitting ${event} ${inspect(args.slice(1), false, 2, true)}`,
      );
    }

    return this.xiao.emit(event, ...args);
  }
}
