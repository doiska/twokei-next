import { type Guild, type GuildResolvable } from "discord.js";
import { type Awaitable, isObject, noop } from "@sapphire/utilities";
import {
  type Connector,
  LoadType,
  type NodeOption,
  type PlayerUpdate,
  Shoukaku,
  type ShoukakuOptions,
  type TrackExceptionEvent,
  type TrackStuckEvent,
  type WebSocketClosedEvent,
} from "@twokei/shoukaku";

import { eq } from "drizzle-orm";
import { kil } from "@/db/Kil";
import { settings } from "@/db/schemas/settings";

import { createLogger } from "@/lib/logger";
import { manualUpdate } from "@/music/embed/events/manual-update";
import { handlePlayerException } from "@/music/embed/events/player-exception";
import { playerDestroyed, queueEmpty } from "@/music/embed/events/queue-empty";
import { youtubeTrackResolver } from "@/music/resolvers/youtube/youtube-track-resolver";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";
import { type Maybe } from "@/utils/types-helper";
import {
  Events,
  PlayerState,
  type VentiInitOptions,
  type XiaoInitOptions,
  XiaoLoadType,
  type XiaoSearchOptions,
  type XiaoSearchResult,
} from "../interfaces/player.types";
import { type TrackResolver } from "../resolvers/resolver";
import { ResolvableTrack } from "../structures/ResolvableTrack";
import { Venti } from "./Venti";

import { EventEmitter } from "events";
import type { Logger } from "winston";
import { spotifyTrackResolver } from "@/music/resolvers/spotify/spotify-track-resolver";
import { TwokeiClient } from "@/structures/TwokeiClient";
import { onShoukakuRestore, storeSession } from "@/music/events/player-restore";

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
  [Events.TrackAdd]: (venti: Venti, track: ResolvableTrack[]) => void;

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
    update?: { embed?: boolean; components?: boolean },
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

  public resolvers: TrackResolver[] = [
    youtubeTrackResolver,
    spotifyTrackResolver,
  ];

  private readonly logger: Logger;

  /**
   * @param client
   * @param options Xiao options
   * @param nodes Shoukaku nodes
   * @param connector Shoukaku connector
   * @param optionsShoukaku Shoukaku options
   * @param dumps
   */
  constructor(
    private readonly client: TwokeiClient,
    public options: XiaoInitOptions,
    connector: Connector,
    nodes: NodeOption[],
    optionsShoukaku: ShoukakuOptions = {},
    dumps: any = {},
  ) {
    super();

    this.logger = createLogger("Xiao");

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
      this.logger.debug(`${name} ${info}`),
    );

    this.shoukaku.on("raw", storeSession);

    this.shoukaku.once("restored", onShoukakuRestore);

    this.on(Events.Debug, (message) => this.logger.debug(message));

    this.on(Events.TrackStart, (venti) => {
      manualUpdate(venti, { embed: true, components: true });
    });

    this.on(Events.TrackAdd, (venti) => {
      manualUpdate(venti, { embed: true, components: true });
    });

    this.on(Events.TrackPause, (venti) => {
      manualUpdate(venti, { embed: true, components: true });
    });

    this.on(Events.PlayerDestroy, playerDestroyed);
    this.on(Events.QueueEmpty, queueEmpty);

    this.on(Events.ManualUpdate, manualUpdate);

    this.on(Events.PlayerException, handlePlayerException);

    void this.loadNodes();
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

  public getPlayer(guildId: GuildResolvable): Venti | undefined {
    const resolvedGuildId = this.client.guilds.resolveId(guildId);

    if (!resolvedGuildId) {
      return;
    }

    return this.players.get(resolvedGuildId);
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
    query: string,
    options?: XiaoSearchOptions,
  ): Promise<XiaoSearchResult> {
    const node = this.shoukaku.getIdealNode();

    const engine = options?.engine ?? "spsearch";

    if (!node) {
      throw new Error("No available nodes");
    }

    const isUrl = /^https?:\/\//.test(query);

    if (options?.resolver ?? true) {
      const resolver = this.resolvers.find(
        (trackResolver) =>
          (!isUrl && trackResolver.name === options?.resolver) ||
          trackResolver.matches(query),
      );

      this.logger.debug(`Resolving ${query} with ${resolver?.name ?? engine}.`);

      if (resolver) {
        return await resolver.resolve(query, options);
      }
    }

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
        tracks: [
          new ResolvableTrack(result.data[0], {
            requester: options?.requester,
          }),
        ],
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

  public setVoiceId(guildId: string, voiceId: string) {
    const player = this.players.get(guildId);

    if (!player) {
      return;
    }

    player.voiceId = voiceId;
  }

  public async loadNodes() {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!this.shoukaku) {
          reject(new Error("Shoukaku could not be loaded in time."));
        }
      }, 30000);

      const interval = setInterval(() => {
        if (this.shoukaku) {
          this.logger.info("Shoukaku is ready! Loading nodes...");
          clearInterval(interval);
          resolve(true);
        }
      }, 300);
    });

    this.shoukaku.nodes.clear();

    const [rawNodes] = await kil
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.name, "Nodes"));

    if (!rawNodes?.value) {
      this.logger.error("Could not retrieve Nodes from the Database");
      return;
    }

    rawNodes?.value.forEach((node) => {
      if (!this.isNode(node)) {
        this.logger.error("Trying to insert invalid Node.", { node });
        return;
      }

      if ("active" in node && node.active === false) {
        return;
      }

      this.shoukaku.addNode(node);
    });
  }

  private isNode(value: unknown): value is NodeOption {
    const requiredKeys = ["name", "url", "auth"];

    if (!isObject(value)) {
      return false;
    }

    return requiredKeys.every((key) => Object.keys(value).includes(key));
  }
}
