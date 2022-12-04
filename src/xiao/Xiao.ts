import { EventEmitter } from 'events';
import {
  Connector,
  LoadType,
  NodeOption, PlayerUpdate,
  Shoukaku,
  ShoukakuOptions,
  Track, TrackExceptionEvent,
  TrackStuckEvent,
  WebSocketClosedEvent
} from "shoukaku";
import { Kazu } from "./managers/Kazu";
import {
  Events,
  KazuInitOptions,
  XiaoInitOptions,
  XiaoSearchOptions,
  XiaoSearchResult
} from "./interfaces/player.types";
import { Snowflake } from "discord.js";


export interface XiaoEvents {
  /**
   * Emitted when a player is created.
   */
  [Events.PlayerCreate]: (kazu: Kazu) => void;

  /**
   * Emitted when a player is destroyed.
   */
  [Events.PlayerDestroy]: (kazu: Kazu) => void;

  /**
   * Emitted when a track starts playing.
   */
  [Events.TrackStart]: (kazu: Kazu, track: Track) => void;

  /**
   * Emitted when a track ends.
   */
  [Events.TrackEnd]: (kazu: Kazu, track: Track) => void;

  /**
   * Emitted when a player got empty.
   */
  [Events.QueueEmpty]: (kazu: Kazu) => void;

  /**
   * Emitted when a player got closed.
   */
  [Events.PlayerClosed]: (kazu: Kazu, data: WebSocketClosedEvent) => void;

  /**
   * Emitted when a player got updated.
   */
  [Events.PlayerStuck]: (kazu: Kazu, data: TrackStuckEvent) => void;

  /**
   * Emitted when a player got an exception.
   */
  [Events.PlayerException]: (kazu: Kazu, data: TrackExceptionEvent) => void;

  /**
   * Emitted when a player updated.
   */
  [Events.PlayerUpdate]: (kazu: Kazu, data: PlayerUpdate) => void;

  /**
   * Emitted when a player resumed.
   */
  [Events.PlayerResumed]: (kazu: Kazu) => void;

  /**
   * Emitted when a player got an error while resolving a track.
   */
  [Events.PlayerResolveError]: (kazu: Kazu, track: Track, message?: string) => void;

  /**
   * Emitted for debugging purposes.
   */
  [Events.Debug]: (message: string) => void;
}

export declare interface Xiao {
  on<U extends keyof XiaoEvents>(event: U, listener: XiaoEvents[U]): this;

  once<U extends keyof XiaoEvents>(event: U, listener: XiaoEvents[U]): this;

  emit<U extends keyof XiaoEvents>(event: U, ...args: Parameters<XiaoEvents[U]>): boolean;
}

export class Xiao extends EventEmitter {

  /**
   * Shoukaku instance
   */
  public shoukaku: Shoukaku;

  /**
   * Kazu players manager
   */
  public readonly players: Map<string, Kazu> = new Map();

  /**
   * @param options Xiao options
   * @param nodes Shoukaku nodes
   * @param connector Shoukaku connector
   * @param optionsShoukaku Shoukaku options
   */
  constructor(
    public options: XiaoInitOptions,
    connector: Connector,
    nodes: NodeOption[],
    optionsShoukaku: ShoukakuOptions = {}
  ) {
    super();

    this.shoukaku = new Shoukaku(connector, nodes, optionsShoukaku);
    this.players = new Map<string, Kazu>();
  }

  public async createPlayer<T extends Kazu>(options: KazuInitOptions): Promise<T | Kazu> {
    const current = this.players.get(options.guild);
    if (current) {
      return current;
    }

    let node = options.nodeName ? this.shoukaku.getNode(options.nodeName) : this.shoukaku.getNode();

    if (!node) {
      throw new Error('No available nodes');
    }

    const player = await node.joinChannel({
      guildId: options.guild,
      channelId: options.channel,
      deaf: options.deaf,
      mute: options.mute,
      shardId: options.shardId || 0
    });

    const kazu = new Kazu(this, player, options);

    this.players.set(options.guild, kazu);
    this.emit(Events.PlayerCreate, kazu);

    return kazu;
  }

  public getPlayer(guildId: Snowflake): Kazu | undefined {
    return this.players.get(guildId);
  }

  public async destroyPlayer(guildId: Snowflake): Promise<void> {
    const player = this.players.get(guildId);
    if (!player) {
      throw new Error('Player not found');
    }

    player.destroy();
    this.players.delete(guildId);
  }

  public async search(query: string, options?: XiaoSearchOptions): Promise<XiaoSearchResult> {
    const node = options?.nodeName ? this.shoukaku.getNode(options.nodeName) : this.shoukaku.getNode();

    if (!node) {
      throw new Error('No available nodes');
    }

    const engine = options?.engine || 'yt';

    if (!['yt', 'youtube_music', 'soundcloud'].includes(engine)) {
      throw new Error('Invalid engine');
    }

    const isUrl = /^https?:\/\//.test(query);
    const search = !isUrl ? `${engine}search:${query}` : query;

    const result = await node.rest.resolve(search);

    if (!result) {
      throw new Error('No result');
    }

    return this.buildSearch(result.loadType, result.tracks, result?.playlistInfo.name);
  }

  private buildSearch(loadType: LoadType, tracks: Track[], playlistName?: string): XiaoSearchResult {
    return {
      playlistName,
      tracks,
      type: loadType
    };
  }
}