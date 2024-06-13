import { type Guild, GuildMember } from "discord.js";
import { type Awaitable, noop } from "@sapphire/utilities";
import {
  type Connector,
  Connectors,
  LoadType,
  type NodeOption,
  type PlayerUpdate,
  Shoukaku,
  type ShoukakuOptions,
  type TrackExceptionEvent,
  type TrackStuckEvent,
  type WebSocketClosedEvent,
} from "@twokei/shoukaku";

import { logger } from "@/lib/logger";
import { refresh } from "@/music/song-channel/embed/events/manual-update";
import { handlePlayerException } from "@/music/song-channel/embed/events/player-exception";
import {
  handleEmptyQueue,
  handlePlayerDestroyed,
} from "@/music/song-channel/embed/events/queue-empty";
import { youtubeResolver } from "@/music/resolvers/youtube";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";
import { type Maybe } from "@/utils/types-helper";
import {
  Events,
  PlayerState,
  type VentiInitOptions,
  XiaoLoadType,
  type XiaoSearchOptions,
  type XiaoSearchResult,
} from "../interfaces/player.types";
import { ResolvableTrack } from "../structures/ResolvableTrack";
import { Venti } from "./Venti";

import { EventEmitter } from "events";
import type { Logger } from "winston";
import { container } from "@sapphire/framework";
import { env } from "@/app/env";
import { type TwokeiClient } from "@/structures/TwokeiClient";

import { playerSessionRestored } from "@/music/sessions/player-session-restored";
import { playerSessionStore } from "@/music/sessions/player-session-store";
import {
  getSessions,
  restoreExpiredSessions,
} from "@/music/sessions/player-session-manager";
import { kil } from "@/db/Kil";
import { coreNodes } from "@/db/schemas/core-nodes";
import { eq } from "drizzle-orm";

export interface XiaoEvents {
  /**
   * Emitted when a player is created.
   */
  [Events.PlayerCreate]: (venti: Venti) => void;

  /**
   * Emitted when a player is destroyed.
   */
  [Events.PlayerDestroy]: (venti: Venti) => void;

  /**
   * Emitted when a track is added to the queue.
   */
  [Events.TrackAdd]: (
    venti: Venti,
    result: XiaoSearchResult,
    requester?: GuildMember,
  ) => void;

  /**
   * Emitted when a track starts playing.
   */
  [Events.TrackStart]: (venti: Venti, track: ResolvableTrack) => void;

  /**
   * Emitted when a track pauses.
   */
  [Events.TrackPause]: (venti: Venti) => void;

  /**
   * Emitted when a track ends.
   */
  [Events.TrackEnd]: (
    venti: Venti,
    track: Maybe<ResolvableTrack>,
    reason?: "Replaced" | "Error" | "Ended",
  ) => void;

  /**
   * Emitted when a player got empty.
   */
  [Events.QueueEmpty]: (venti: Venti) => void;

  /**
   * Emitted when a player got closed.
   */
  [Events.PlayerClosed]: (venti: Venti, data: WebSocketClosedEvent) => void;

  /**
   * Emitted when a player got updated.
   */
  [Events.PlayerStuck]: (venti: Venti, data: TrackStuckEvent) => void;

  /**
   * Emitted when a player got an exception.
   */
  [Events.PlayerException]: (
    venti: Venti,
    data: TrackExceptionEvent,
  ) => Awaitable<void>;

  /**
   * Emitted when a player updated.
   */
  [Events.PlayerUpdate]: (venti: Venti, data: PlayerUpdate) => void;

  /**
   * Emitted when a player resumed.
   */
  [Events.PlayerResumed]: (venti: Venti) => void;

  /**
   * Emitted when a player got an error while resolving a track.
   */
  [Events.PlayerResolveError]: (
    venti: Venti,
    track: ResolvableTrack,
    message?: string,
  ) => void;

  /**
   * Emitted when user interact and causes manual update
   */
  [Events.ManualUpdate]: (
    venti: Venti,
    update?: Partial<{ embed: boolean; components: boolean }>,
  ) => void;

  /**
   * Emitted for debugging purposes.
   */
  [Events.Debug]: (message: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export declare interface Xiao {
  on: <U extends keyof XiaoEvents>(event: U, listener: XiaoEvents[U]) => this;

  once: <U extends keyof XiaoEvents>(event: U, listener: XiaoEvents[U]) => this;

  emit: <U extends keyof XiaoEvents>(
    event: U,
    ...args: Parameters<XiaoEvents[U]>
  ) => boolean;
}

/**
 * The main class for Xiao.
 * Player manager for Venti.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Xiao extends EventEmitter {
  /**
   * Shoukaku instance
   */
  public shoukaku: Shoukaku;

  /**
   * Venti players manager
   */
  public readonly players = new Map<string, Venti>();

  public resolvers = [youtubeResolver];

  private readonly logger: Logger;

  static async init(client: TwokeiClient) {
    const nodes = await kil
      .select()
      .from(coreNodes)
      .where(eq(coreNodes.enabled, true));

    const sessions = await getSessions();

    container.xiao = new Xiao(
      new Connectors.DiscordJS(client),
      nodes,
      {
        resume: true,
        moveOnDisconnect: true,
        reconnectInterval: 3,
        reconnectTries: 20,
        userAgent: `Twokei (${env.NODE_ENV})`,
      },
      sessions.dump,
    );

    client.once("ready", async () => {
      await restoreExpiredSessions(sessions.expired);
    });
  }

  /**
   * @param nodes Shoukaku nodes
   * @param connector Shoukaku connector
   * @param optionsShoukaku Shoukaku options
   * @param dumps
   */
  constructor(
    connector: Connector,
    nodes: NodeOption[],
    optionsShoukaku: ShoukakuOptions = {},
    dumps: any[] = [],
  ) {
    super();

    this.logger = logger.child({
      module: "XIAO",
    });

    this.logger.info(
      `Xiao is being initialized with ${nodes.length} nodes and ${dumps.length} to restore.`,
    );

    this.shoukaku = new Shoukaku(connector, nodes, optionsShoukaku, dumps);

    this.players = new Map<string, Venti>();

    this.shoukaku.on("ready", (name: string) =>
      this.logger.info(`[Shoukaku] Node ${name} is now connected`),
    );

    this.shoukaku.on("error", (name: string, error: Error) =>
      this.logger.error(
        `[Shoukaku] Node ${name} emitted error: ${error.name}`,
        { message: error.message, stack: error.stack },
      ),
    );

    this.shoukaku.on("debug", (name: string, info: string) =>
      this.logger.debug(`[Shoukaku] ${name} ${info}`),
    );

    this.shoukaku.on("raw", playerSessionStore);
    this.shoukaku.once("restored", playerSessionRestored);

    this.on(Events.Debug, (message) => this.logger.debug(message));

    this.on(Events.TrackStart, (venti) => refresh(venti, { components: true }));
    this.on(Events.TrackAdd, (venti) => refresh(venti, { components: true }));
    this.on(Events.TrackPause, (venti) => refresh(venti, { components: true }));
    this.on(Events.ManualUpdate, refresh);

    this.on(Events.PlayerDestroy, handlePlayerDestroyed);
    this.on(Events.QueueEmpty, handleEmptyQueue);

    this.on(Events.PlayerException, handlePlayerException);
  }

  public async createPlayer<T extends Venti>(
    options: VentiInitOptions,
  ): Promise<T | Venti> {
    const current = this.players.get(options.guild.id);

    if (current) {
      return current;
    }

    const player = await this.shoukaku.joinVoiceChannel({
      guildId: options.guild.id,
      channelId: options.voiceChannel,
      deaf: options.deaf,
      mute: options.mute,
      shardId: options.shardId ?? 0,
    });

    const venti = new Venti(this, player, options);

    this.players.set(options.guild.id, venti);
    this.emit(Events.PlayerCreate, venti);

    return venti;
  }

  public getPlayer(guildId: string): Venti | undefined {
    return this.players.get(guildId);
  }

  public async destroyPlayer(guild: Guild, reason = "Unknown") {
    this.logger.info(`Destroying player for guild ${guild.id}`, {
      guildId: guild.id,
      guildName: guild.name,
      reason,
    });

    const player = this.players.get(guild.id);

    if (player) {
      player.state = PlayerState.DESTROYING;
    }

    await this.shoukaku.leaveVoiceChannel(guild.id).catch(async () => {
      await guild.members.me?.voice?.disconnect().catch(noop);
    });

    if (player) {
      player.state = PlayerState.DESTROYED;
      this.emit(Events.PlayerDestroy, player);
    }

    this.players.delete(guild.id);
  }

  public async search(
    _query: string,
    options?: XiaoSearchOptions,
  ): Promise<XiaoSearchResult> {
    const node = this.shoukaku.getIdealNode();

    const engine = options?.engine ?? "spsearch";

    if (!node) {
      throw new Error("No available nodes");
    }

    const query = _query.trim();

    if (!query) {
      throw new Error("No query provided");
    }

    const isUrl = query.startsWith("http");
    const search = !isUrl ? `${engine}:${query}` : query;

    const result = await node.rest.resolve(search);

    if (!result || result.loadType === XiaoLoadType.NO_MATCHES) {
      throw new FriendlyException(ErrorCodes.PLAYER_NO_TRACKS_FOUND);
    }

    if (result.loadType === XiaoLoadType.TRACK_LOADED) {
      return {
        type: XiaoLoadType.TRACK_LOADED,
        tracks: [
          new ResolvableTrack(result.data, {
            requester: options?.requester,
          }),
        ],
      };
    }

    if (result.loadType === LoadType.SEARCH) {
      return {
        type: XiaoLoadType.SEARCH_RESULT,
        tracks: result.data.map(
          (track) =>
            new ResolvableTrack(track, { requester: options?.requester }),
        ),
      };
    }

    if (result.loadType === LoadType.PLAYLIST) {
      return {
        type: XiaoLoadType.PLAYLIST_LOADED,
        playlist: {
          name: result.data.info.name ?? "Playlist",
          url: query,
        },
        tracks: result.data.tracks.map(
          (track) =>
            new ResolvableTrack(track, { requester: options?.requester }),
        ),
      };
    }

    return {
      type: XiaoLoadType.NO_MATCHES,
      tracks: [],
    };
  }
}
