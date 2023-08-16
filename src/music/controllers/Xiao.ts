import { type Guild, type GuildResolvable } from 'discord.js';
import { type Awaitable, isObject, noop } from '@sapphire/utilities';
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

import { eq } from 'drizzle-orm';
import { kil } from '@/db/Kil';
import { settings } from '@/db/schemas/settings';

import { Twokei } from '@/app/Twokei';
import { createLogger } from '@/modules/logger-transport';
import { manualUpdate } from '@/music/embed/events/manual-update';
import { handlePlayerException } from '@/music/embed/events/player-exception';
import { queueEmpty } from '@/music/embed/events/queue-empty';
import { type Maybe } from '@/utils/utils';
import {
  Events,
  LoadType,
  type VentiInitOptions,
  type XiaoInitOptions,
  type XiaoSearchOptions,
  type XiaoSearchResult,
} from '../interfaces/player.types';
import { type TrackResolver } from '../resolvers/resolver';
import { spotifyTrackResolver } from '../resolvers/spotify/spotify-track-resolver';
import { ResolvableTrack } from '../structures/ResolvableTrack';
import { Venti } from './Venti';

import { EventEmitter } from 'events';
import type { Logger } from 'winston';

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
  [Events.TrackEnd]: (venti: Venti, track: Maybe<ResolvableTrack>, reason?: 'Replaced' | 'Error' | 'Ended') => void

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
  [Events.PlayerException]: (venti: Venti, data: TrackExceptionEvent) => Awaitable<void>

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

  public resolvers: TrackResolver[] = [spotifyTrackResolver];

  private readonly logger: Logger;

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

    this.logger = createLogger('Xiao');

    this.shoukaku = new Shoukaku(connector, nodes, optionsShoukaku);

    this.players = new Map<string, Venti>();

    this.shoukaku.on('ready', (name) => this.logger.info(`[Shoukaku] Node ${name} is now connected`));

    this.shoukaku.on('close', (name, code, reason) => this.logger.debug(
      `[Shoukaku] Node ${name} closed with code ${code} and reason ${reason}`,
    ));

    this.shoukaku.on(
      'error',
      (name, error) => this.logger.error(`[Shoukaku] Node ${name} emitted error: ${error.message}`, { error }),
    );

    this.shoukaku.on('debug', (name, info) => this.logger.debug(`${name} ${info}`));

    this.on(Events.Debug, (message) => this.logger.debug(message));

    this.on(Events.TrackStart, (venti) => { manualUpdate(venti, { embed: true, components: true }); });
    this.on(Events.TrackAdd, (venti) => { manualUpdate(venti, { embed: true, components: true }); });
    this.on(Events.TrackPause, (venti) => { manualUpdate(venti, { embed: true, components: true }); });

    this.on(Events.PlayerDestroy, queueEmpty);
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

  public async destroyPlayer (guild: Guild) {
    this.logger.info(`Destroying player for guild ${guild.id}`, {
      guildId: guild.id,
      guildName: guild.name,
    });

    await guild.members.me?.voice?.disconnect()
      .catch(noop);

    const player = this.players.get(guild.id);

    if (!player) {
      return;
    }

    player.destroy();

    this.players.delete(guild.id);
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

      this.logger.debug(
        `Resolving ${query} with ${resolver?.name ?? 'default resolver'}`,
      );

      if (resolver) {
        return await resolver.resolve(query, options);
      }
    }

    const engine = options?.engine ?? 'yt';
    const searchType = options?.searchType ?? 'track';

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
      };
    }

    return {
      type: LoadType.PLAYLIST_LOADED,
      playlist: {
        name: result.playlistInfo.name ?? 'Playlist',
        url: query,
      },
      tracks: result.tracks.map(
        (track) => new ResolvableTrack(track, { requester: options?.requester }),
      ),
    };
  }

  private async loadNodes () {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!this.shoukaku.id) {
          reject(new Error('Shoukaku could not be loaded in time.'));
        }
      }, 20000);

      const interval = setInterval(() => {
        if (this.shoukaku.id) {
          this.logger.info('Shoukaku is ready! Loading nodes...');
          clearInterval(interval);
          resolve(true);
        }
      }, 300);
    });

    const [rawNodes] = await kil.select({ value: settings.value })
      .from(settings)
      .where(eq(settings.name, 'Nodes'));

    if (!rawNodes?.value) {
      this.logger.error('Could not retrieve Nodes from the Database');
      return;
    }

    rawNodes?.value.forEach(node => {
      if (!this.isNode(node)) {
        this.logger.error('Trying to insert invalid Node.', { node });
        return;
      }

      this.shoukaku.addNode(node);
    });
  }

  isNode (value: unknown): value is NodeOption {
    const requiredKeys = ['name', 'url', 'auth'];

    if (!isObject(value)) {
      return false;
    }

    return requiredKeys
      .every(key => Object.keys(value).includes(key));
  }
}
