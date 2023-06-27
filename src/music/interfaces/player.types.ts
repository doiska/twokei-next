import {Snowflake, User} from 'discord.js';

import {Locale} from '../../i18n/i18n';
import {Maybe} from '../../utils/type-guards';
import {ResolvableTrack} from '../structures/ResolvableTrack';

export enum LoadType {
    TRACK_LOADED = 'TRACK_LOADED',
    PLAYLIST_LOADED = 'PLAYLIST_LOADED',
    SEARCH_RESULT = 'SEARCH_RESULT',
    NO_MATCHES = 'NO_MATCHES',
    LOAD_FAILED = 'LOAD_FAILED'
}

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
    requester?: User;
    engine?: SearchEngines;
    nodeName?: string;
    searchType?: 'track' | 'playlist';
    resolve?: boolean;
}

export interface XiaoSearchResult {
    type: LoadType;
    playlistName?: string;
    tracks: ResolvableTrack[];
}

export interface VentiInitOptions {
    guild: Snowflake;
    voiceChannel: Snowflake;
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
    }
}

export enum Events {
    PlayerDestroy = 'playerDestroy',
    PlayerCreate = 'playerCreate',

    TrackStart = 'trackStart',
    TrackPause = 'trackPause',
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

    ManualUpdate = 'manualUpdate',
}

export enum PlayerState {
    CONNECTING,
    CONNECTED,
    DISCONNECTING,
    DISCONNECTED,
    DESTROYING,
    DESTROYED,
}