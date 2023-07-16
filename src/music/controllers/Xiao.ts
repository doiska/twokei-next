import { type Guild, type GuildResolvable } from 'discord.js';

import {
  type Connector,
  type NodeOption,
  type PlayerUpdate,
  Shoukaku,
  type ShoukakuOptions,
  type TrackExceptionEvent,
  type TrackStuckEvent,
  type WebSocketClosedEvent,
} from 'shoukaku';
import { EventEmitter } from 'events';
import { type Maybe } from '@/utils/utils';
import { logger, playerLogger } from '@/modules/logger-transport';
import { Twokei } from '@/app/Twokei';

import { Venti } from './Venti';
import { ResolvableTrack } from '../structures/ResolvableTrack';
import { SpotifyResolver } from '../resolvers/spotify/spotify-resolver';
import { type TrackResolver } from '../resolvers/resolver';
import {
  Events,
  LoadType,
  type VentiInitOptions,
  type XiaoInitOptions,
  type XiaoSearchOptions,
  type XiaoSearchResult,
} from '../interfaces/player.types';
import { playerDestroy, queueEmpty } from '../events/queue-empty';
import { manualUpdate } from '../events/manual-update';

export interface XiaoEvents {
  /**
   * Emitted when a player is created.
   */
  [Events.PlayerCreate]: (venti: Venti) => void

  /**
   * Emitted when a player is destroyed.
   */
  [Events.PlayerDestroy]: (venti: Venti) => void

  /**
   * Emitted when a track is added to the queue.
   */
  [Events.TrackAdd]: (venti: Venti, track: ResolvableTrack[]) => void

  /**
   * Emitted when a track starts playing.
   */
  [Events.TrackStart]: (venti: Venti, track: ResolvableTrack) => void

  /**
   * Emitted when a track pauses.
   */
  [Events.TrackPause]: (venti: Venti) => void

  /**
   * Emitted when a track ends.
   */
  [Events.TrackEnd]: (venti: Venti, track: Maybe<ResolvableTrack>) => void

  /**
   * Emitted when a player got empty.
   */
  [Events.QueueEmpty]: (venti: Venti) => void

  /**
   * Emitted when a player got closed.
   */
  [Events.PlayerClosed]: (venti: Venti, data: WebSocketClosedEvent) => void

  /**
   * Emitted when a player got updated.
   */
  [Events.PlayerStuck]: (venti: Venti, data: TrackStuckEvent) => void

  /**
   * Emitted when a player got an exception.
   */
  [Events.PlayerException]: (venti: Venti, data: TrackExceptionEvent) => void

  /**
   * Emitted when a player updated.
   */
  [Events.PlayerUpdate]: (venti: Venti, data: PlayerUpdate) => void

  /**
   * Emitted when a player resumed.
   */
  [Events.PlayerResumed]: (venti: Venti) => void

  /**
   * Emitted when a player got an error while resolving a track.
   */
  [Events.PlayerResolveError]: (
    venti: Venti,
    track: ResolvableTrack,
    message?: string
  ) => void

  /**
   * Emitted when user interact and causes manual update
   */
  [Events.ManualUpdate]: (
    venti: Venti,
    update?: { embed?: boolean, components?: boolean }
  ) => void

  /**
   * Emitted for debugging purposes.
   */
  [Events.Debug]: (message: string) => void
}

export declare interface Xiao {
  on: <U extends keyof XiaoEvents>(event: U, listener: XiaoEvents[U]) => this

  once: <U extends keyof XiaoEvents>(event: U, listener: XiaoEvents[U]) => this

  emit: <U extends keyof XiaoEvents>(
    event: U,
    ...args: Parameters<XiaoEvents[U]>
  ) => boolean
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
  public readonly players = new Map<string, Venti>();

  public resolvers: TrackResolver[] = [new SpotifyResolver()];

  /**
   * @param options Xiao options
   * @param nodes Shoukaku nodes
   * @param connector Shoukaku connector
   * @param optionsShoukaku Shoukaku options
   */
  constructor (
    public options: XiaoInitOptions,
    connector: Connector,
    nodes: NodeOption[],
    optionsShoukaku: ShoukakuOptions = {},
  ) {
    super();

    this.shoukaku = new Shoukaku(connector, nodes, optionsShoukaku);

    this.players = new Map<string, Venti>();

    this.shoukaku.on('ready', (name) => playerLogger.info(`[Shoukaku] Node ${name} is now connected`));
    this.shoukaku.on('close', (name, code, reason) => playerLogger.debug(
      `[Shoukaku] Node ${name} closed with code ${code} and reason ${reason}`,
    ));
    this.shoukaku.on('error', (name, error) => playerLogger.error(`[Shoukaku] Node ${name} emitted error: ${error.message}`, { error }));

    this.on(Events.Debug, (message) => logger.debug(message));

    this.on(Events.TrackStart, (venti) => { manualUpdate(venti, { embed: true, components: true }); });
    this.on(Events.TrackAdd, (venti) => { manualUpdate(venti, { embed: true, components: true }); });
    this.on(Events.TrackPause, (venti) => { manualUpdate(venti, { embed: true, components: true }); });

    this.on(Events.PlayerDestroy, playerDestroy);
    this.on(Events.QueueEmpty, queueEmpty);

    this.on(Events.ManualUpdate, manualUpdate);

    void this.loadNodes();
  }

  public async createPlayer<T extends Venti>(
    options: VentiInitOptions,
  ): Promise<T | Venti> {
    const current = this.players.get(options.guild.id);

    if (current) {
      return current;
    }

    const node = options.nodeName
      ? this.shoukaku.getNode(options.nodeName)
      : this.shoukaku.getNode();

    if (!node) {
      throw new Error('No available nodes');
    }

    const player = await node.joinChannel({
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

  public getPlayer (guildId: GuildResolvable): Venti | undefined {
    const resolvedGuildId = Twokei.guilds.resolveId(guildId);

    if (!resolvedGuildId) {
      return;
    }

    return this.players.get(resolvedGuildId);
  }

  public async destroyPlayer (guild: Guild): Promise<void> {
    this.players.delete(guild.id);

    await guild.members.me?.voice?.disconnect();

    const player = this.players.get(guild.id);

    if (!player) {
      return;
    }

    player.destroy();
  }

  public async search (
    query: string,
    options?: XiaoSearchOptions,
  ): Promise<XiaoSearchResult> {
    const node = options?.nodeName
      ? this.shoukaku.getNode(options.nodeName)
      : this.shoukaku.getNode();

    if (!node) {
      throw new Error('No available nodes');
    }

    if (options?.resolve ?? true) {
      const resolver = this.resolvers.find((trackResolver) => trackResolver.matches(query));

      logger.debug(
        `Resolving ${query} with ${resolver?.name ?? 'default resolver'}`,
      );

      if (resolver) {
        return await resolver.resolve(query, options);
      }
    }

    const engine = options?.engine ?? 'yt';
    const searchType = options?.searchType ?? 'track';

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
        type: LoadType.SEARCH_RESULT,
        tracks: [
          new ResolvableTrack(result.tracks[0], {
            requester: options?.requester,
          }),
        ],
        playlistName: result.playlistInfo?.name,
      };
    }

    return {
      type: LoadType.PLAYLIST_LOADED,
      tracks: result.tracks.map(
        (track) => new ResolvableTrack(track, { requester: options?.requester }),
      ),
      playlistName: result.playlistInfo?.name,
    };
  }

  public getMatchingResolver (query: string): TrackResolver | undefined {
    return this.resolvers.find((resolver) => resolver.matches(query));
  }

  private async loadNodes () {
    // const webNodes = getWebNodes();
    //
    // if (webNodes) {
    //   console.log('Web nodes found, loading...');
    //   console.log(webNodes);
    // }
  }
}
