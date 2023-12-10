import { type Guild, type Snowflake, type User } from "discord.js";

import { type Locale } from "@/locales/i18n";
import { type Maybe } from "@/utils/types-helper";
import { type ResolvableTrack } from "../structures/ResolvableTrack";
import { LoadType } from "@twokei/shoukaku";

export const XiaoLoadType = {
  TRACK_LOADED: LoadType.TRACK,
  PLAYLIST_LOADED: LoadType.PLAYLIST,
  SEARCH_RESULT: LoadType.SEARCH,
  NO_MATCHES: LoadType.EMPTY,
  LOAD_FAILED: LoadType.ERROR,
} as const;

export type XiaoLoadType = (typeof XiaoLoadType)[keyof typeof XiaoLoadType];

export type SearchEngines = "youtube" | "soundcloud" | "youtube_music" | string;

export interface XiaoSearchOptions {
  requester?: User;
  engine?: SearchEngines;
  nodeName?: string;
  resolver?: string;
}

interface PlaylistLoaded {
  type: typeof XiaoLoadType.PLAYLIST_LOADED;
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
  type: Exclude<XiaoLoadType, typeof XiaoLoadType.PLAYLIST_LOADED>;
  tracks: ResolvableTrack[];
}

export type XiaoSearchResult = PlaylistLoaded | TrackLoaded;

export interface VentiInitOptions {
  guild: Guild;
  voiceChannel: Snowflake;
  lang: Locale;
  deaf?: boolean;
  mute?: boolean;
  shardId?: number;
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
