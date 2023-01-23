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
} from 'shoukaku';
import { Venti } from './Venti';
import {
  Events,
  VentiInitOptions,
  XiaoInitOptions,
  XiaoSearchOptions,
  XiaoSearchResult
} from '../interfaces/player.types';
import { EmbedBuilder, Snowflake, TextChannel } from 'discord.js';
import { Twokei } from '../../app/Twokei';
import { trackStart } from '../events/track-start';
import { playerDestroy } from '../events/player-destroy';
import { trackAdd } from '../events/track-add';


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
  [Events.TrackAdd]: (venti: Venti, track: Track[]) => void;

  /**
   * Emitted when a track starts playing.
   */
  [Events.TrackStart]: (venti: Venti, track: Track) => void;

  /**
   * Emitted when a track ends.
   */
  [Events.TrackEnd]: (venti: Venti, track: Track) => void;

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
  [Events.PlayerException]: (venti: Venti, data: TrackExceptionEvent) => void;

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
  [Events.PlayerResolveError]: (venti: Venti, track: Track, message?: string) => void;

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

/**
 * The main class for Xiao.
 * Player manager for Venti.
 */
export class Xiao extends EventEmitter {

  /**
   * Shoukaku instance
   */
  public shoukaku: Shoukaku;

  /**
   * Venti players manager
   */
  public readonly players: Map<string, Venti> = new Map();

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
    this.players = new Map<string, Venti>();
  }

  public async createPlayer<T extends Venti>(options: VentiInitOptions): Promise<T | Venti> {
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
      channelId: options.voiceChannel,
      deaf: options.deaf,
      mute: options.mute,
      shardId: options.shardId || 0
    });

    const venti = new Venti(this, player, {
      ...options,
      message: options.message,
    });

    this.on(Events.TrackStart, trackStart);
    this.on(Events.TrackAdd, trackAdd);
    this.on(Events.PlayerDestroy, playerDestroy);

    this.players.set(options.guild, venti);
    this.emit(Events.PlayerCreate, venti);

    return venti;
  }

  public getPlayer(guildId: Snowflake): Venti | undefined {
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
    const searchType = options?.searchType || 'track';

    if (!['yt', 'youtube_music', 'soundcloud'].includes(engine)) {
      throw new Error('Invalid engine');
    }

    const isUrl = /^https?:\/\//.test(query);
    const search = !isUrl ? `${engine}search:${query}` : query;

    const result = await node.rest.resolve(search);

    if (!result || result.loadType === 'NO_MATCHES') {
      throw new Error('No result');
    }

    if (result.loadType === 'SEARCH_RESULT' && searchType === 'track') {
      return {
        type: result.loadType,
        tracks: [result.tracks[0]],
        playlistName: result.playlistInfo?.name
      }
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