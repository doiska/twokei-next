import { type Guild, type Snowflake } from "discord.js";
import {
  type Player,
  type PlayerUpdate,
  type PlayOptions as ShoukakuPlayOptions,
  type TrackStuckEvent,
  type WebSocketClosedEvent,
} from "@twokei/shoukaku";

import { logger, playerLogger } from "@/lib/logger";
import {
  Events,
  PlayerState,
  type VentiInitOptions,
} from "../interfaces/player.types";
import { ResolvableTrack } from "../structures/ResolvableTrack";
import { TrackQueue } from "../structures/TrackQueue";
import type { Xiao, XiaoEvents } from "./Xiao";

import { inspect } from "node:util";
import type { Logger } from "winston";

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
   * Loop state of the player.
   */
  public loop: LoopStates = LoopStates.NONE;

  /**
   * The player's state.
   */
  public state: PlayerState = PlayerState.CONNECTING;

  /**
   * Song queue.
   */
  public queue: TrackQueue;

  /**
   * The Xiao instance.
   * @private
   */
  private readonly xiao: Xiao;

  private readonly logger: Logger;

  constructor(xiao: Xiao, player: Player, options: VentiInitOptions) {
    this.xiao = xiao;
    this.instance = player;
    this.guild = options.guild;
    this.guildId = options.guild.id;

    this.queue = new TrackQueue();

    this.logger = logger.child({
      module: "VENTI",
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

      if (data.reason === "replaced") {
        this.emit(Events.TrackEnd, this, this.queue?.current, "Replaced");
        return;
      }

      if (["LOAD_FAILED", "CLEAN_UP"].includes(data.reason)) {
        this.queue.previous = this.queue.current;

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
        this.emit(Events.QueueEmpty, this);
        return;
      }

      void this.play();
    });

    this.instance.on("closed", (data: WebSocketClosedEvent) => {
      this.emit(Events.PlayerClosed, this, data);
    });

    this.instance.on("exception", (error) => {
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

  public async play(
    track?: ResolvableTrack,
    userPlayOptions?: ShoukakuPlayOptions["options"],
  ) {
    const playOptions = {
      ...userPlayOptions,
    };

    if (this.state === PlayerState.DESTROYED) {
      throw new Error("Player is destroyed");
    }

    if (!track && !this.queue.totalSize) {
      throw new Error("No track provided and queue is empty");
    }

    if (track && playOptions.noReplace && this.queue.current) {
      this.logger.debug(
        `Queueing track ${track.title} for guild ${this.guildId}`,
      );
      this.queue.unshift(this.queue.current);
    }

    if (this.queue.current?.getRaw) {
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
      .resolve()
      .then((resolvedTrack) => {
        this.queue.current = resolvedTrack;

        const shoukakuPlayOptions: ShoukakuPlayOptions = {
          info: resolvedTrack.getRaw().info,
          ...resolvedTrack,
          options: playOptions,
        };

        this.logger.info(
          `Playing track "${this.queue.current.title}" for guild "${this.guild.name}" (${this.guildId}) - ${this.queue.totalSize} tracks left in queue.`,
        );

        this.instance.playTrack(shoukakuPlayOptions);

        this.emit(Events.TrackStart, this, resolvedTrack);
      })
      .catch((err: Error) => {
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
      amount = this.queue.totalSize;
    }

    this.setLoop(LoopStates.NONE);

    this.queue.splice(0, amount - 1);
    await this.instance.stopTrack();
    return this;
  }

  public pause() {
    this.logger.debug(
      `Pausing player for guild ${this.guildId} - ${!this.instance.paused}`,
    );

    this.instance.setPaused(!this.instance.paused);

    this.logger.debug(
      `Player for guild ${this.guildId} is now ${
        !this.instance.paused ? "paused" : "playing"
      }`,
    );

    this.emit(Events.TrackPause, this);

    return this.paused;
  }

  public get paused() {
    return this.instance.paused;
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

  public get playing() {
    return !!(
      !this.paused &&
      this.state === PlayerState.CONNECTING &&
      this.queue.current
    );
  }

  public get voiceId() {
    return this.instance?.connection?.channelId;
  }
}
