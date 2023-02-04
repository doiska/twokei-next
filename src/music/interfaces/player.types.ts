import { Message, Snowflake } from 'discord.js';
import { Track, LoadType } from "shoukaku";
import { Maybe } from "../../utils/utility-types";

export type SearchEngines = 'youtube' | 'soundcloud' | 'youtube_music' | string;

export interface XiaoInitOptions {

  /**
   * Default search engine if none is specified, defaults to "YouTube".
   */
  defaultSearchEngine: SearchEngines;

  /**
   * Send to guild's shard
   */
  send: (guildId: Snowflake, payload: Payload) => void;
}

export interface XiaoSearchOptions {
  requester: unknown;
  engine?: SearchEngines;
  nodeName?: string;
  searchType?: 'track' | 'playlist';
}

export interface XiaoSearchResult {
  type: LoadType;
  playlistName?: string;
  tracks: Track[];
}

export interface VentiInitOptions {
  guild: Snowflake;
  voiceChannel: Snowflake;
  deaf?: boolean;
  mute?: boolean;
  shardId?: number;
  balancer?: boolean;
  nodeName?: string;
}

export interface PlayOptions {
  pause?: boolean;
  startTime?: number;
  endTime?: number;
  replace?: boolean;
}

export interface Payload {
  op: number;
  d: {
    guild_id: string;
    channel_id: Maybe<string>;
    self_mute: Maybe<boolean>;
    self_deaf: Maybe<boolean>;
  }
}

export enum Events {
  PlayerDestroy = 'playerDestroy',
  PlayerCreate = 'playerCreate',

  TrackStart = 'trackStart',
  TrackEnd = 'trackEnd',
  QueueEmpty = 'queueEmpty',

  PlayerClosed = 'playerClosed',
  PlayerUpdate = 'playerUpdate',
  PlayerException = 'playerException',
  PlayerError = 'playerError',
  PlayerResumed = 'playerResumed',
  PlayerStuck = 'playerStuck',
  PlayerResolveError = 'playerResolveError',
  PlayerMoved = 'playerMoved',

  Debug = 'debug',
  TrackAdd = 'trackAdd',
  TrackRemove = 'trackRemove',
}

export enum PlayerState {
  CONNECTING,
  CONNECTED,
  DISCONNECTING,
  DISCONNECTED,
  DESTROYING,
  DESTROYED,
}