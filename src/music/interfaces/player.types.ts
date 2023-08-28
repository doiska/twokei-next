import {
  type Guild,
  type Message,
  type Snowflake,
  type User,
} from "discord.js";

import { type Locale } from "@/locales/i18n";
import { type Maybe } from "@/utils/utils";
import { type ResolvableTrack } from "../structures/ResolvableTrack";

export enum LoadType {
  TRACK_LOADED = "TRACK_LOADED",
  PLAYLIST_LOADED = "PLAYLIST_LOADED",
  SEARCH_RESULT = "SEARCH_RESULT",
  NO_MATCHES = "NO_MATCHES",
  LOAD_FAILED = "LOAD_FAILED",
}

export type SearchEngines = "youtube" | "soundcloud" | "youtube_music" | string;

export interface XiaoInitOptions {
  /**
   * Default search engine if none is specified, defaults to "YouTube".
   */

  /**
   * Send to guild's shard
   */
  send: (guildId: Snowflake, payload: Payload) => void;
}

export interface XiaoSearchOptions {
  requester?: User;
  engine?: SearchEngines;
  nodeName?: string;
  searchType?: "track" | "playlist";
  resolve?: boolean;
}

interface PlaylistLoaded {
  type: LoadType.PLAYLIST_LOADED;
  playlist: {
    name: string;
    owner?: {
      name: string;
      url: string;
    };
    url: string;
  };
  tracks: ResolvableTrack[];
}

interface TrackLoaded {
  type: Exclude<LoadType, LoadType.PLAYLIST_LOADED>;
  tracks: ResolvableTrack[];
}

export type XiaoSearchResult = PlaylistLoaded | TrackLoaded;

export interface VentiInitOptions {
  guild: Guild;
  voiceChannel: Snowflake;
  embedMessage?: Message;
  lang: Locale;
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
  };
}

export enum Events {
  PlayerDestroy = "playerDestroy",
  PlayerCreate = "playerCreate",

  TrackStart = "trackStart",
  TrackPause = "trackPause",
  TrackEnd = "trackEnd",
  QueueEmpty = "queueEmpty",

  PlayerClosed = "playerClosed",
  PlayerUpdate = "playerUpdate",
  PlayerException = "playerException",
  PlayerError = "playerError",
  PlayerResumed = "playerResumed",
  PlayerStuck = "playerStuck",
  PlayerResolveError = "playerResolveError",
  PlayerMoved = "playerMoved",

  Debug = "debug",
  TrackAdd = "trackAdd",
  TrackRemove = "trackRemove",

  ManualUpdate = "manualUpdate",
}

export enum PlayerState {
  CONNECTING,
  CONNECTED,
  DISCONNECTING,
  DISCONNECTED,
  DESTROYING,
  DESTROYED,
}
