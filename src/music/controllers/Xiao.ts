import { EventEmitter } from 'events';
import {
  Connector,
  NodeOption,
  PlayerUpdate,
  Shoukaku,
  ShoukakuOptions,
  Track,
  TrackExceptionEvent,
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
import { GuildManager, GuildResolvable, Snowflake } from 'discord.js';
import { trackStart } from '../events/track-start';
import { playerDestroy } from '../events/player-destroy';
import { trackAdd } from '../events/track-add';
import { GuildEmbedManager } from '../embed/guild-embed-manager';
import { Twokei } from '../../app/Twokei';
import { PlayerException } from '../../exceptions/PlayerException';


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

  public embedManager: GuildEmbedManager;

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
    this.embedManager = new GuildEmbedManager();
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

    const venti = new Venti(this, player, options);

    this.on(Events.TrackStart, trackStart);
    this.on(Events.TrackAdd, trackAdd);
    this.on(Events.PlayerDestroy, playerDestroy);

    this.players.set(options.guild, venti);
    this.emit(Events.PlayerCreate, venti);

    return venti;
  }

  public getPlayer(guildId: GuildResolvable): Venti | undefined {

    const resolvedGuildId = Twokei.guilds.resolveId(guildId);

    if (!resolvedGuildId) {
      return;
    }

    return this.players.get(resolvedGuildId);
  }

  public async destroyPlayer(guildId: GuildResolvable): Promise<void> {
    const resolvedGuildId = Twokei.guilds.resolveId(guildId);

    if(!resolvedGuildId) {
      throw new PlayerException('Guild not found');
    }

    const player = this.players.get(resolvedGuildId);
    if (!player) {
      throw new PlayerException('Player not found');
    }

    player.destroy();
    this.players.delete(resolvedGuildId);
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

    return {
      type: result.loadType,
      tracks: result.tracks,
      playlistName: result.playlistInfo?.name
    }
  }
}