import { User } from 'discord.js';

import {
  LoadType,
  XiaoSearchOptions,
  XiaoSearchResult,
} from '../../interfaces/player.types';
import { ResolvableTrack } from '../../structures/ResolvableTrack';
import { TrackResolver } from '../resolver';
import { SpotifyRequestManager } from './spotify-request-manager';
import {
  PlaylistTracks,
  SpotifyPlaylistResponse,
  SpotifySearchResponse,
  SpotifyTrackResponse,
} from './spotify.types';

interface SpotifyClient {
  clientId: string;
  clientSecret: string;
}

export interface SpotifyResolverOptions {
  clients: SpotifyClient[];
  region: string;
  limits: {
    search: number;
    playlists: number;
    tracks: number;
    albums: number;
  };
}

const SPOTIFY_URL = /(?:https?:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|album|artist)[/:]([A-Za-z0-9]+)/;

export class SpotifyResolver implements TrackResolver {
  readonly name = 'spotify';

  private requestManager: SpotifyRequestManager;

  private options: SpotifyResolverOptions;

  constructor() {
    const defaultOptions = {
      region: 'BR',
      limits: {
        search: 5,
        playlists: 5,
        tracks: 5,
        albums: 10,
      },
      clients: [
        {
          clientId: process.env.SPOTIFY_CLIENT_ID ?? '',
          clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? '',
        },
      ],
    };
    this.options = defaultOptions;
    this.requestManager = new SpotifyRequestManager(defaultOptions);
  }

  public matches(url: string): boolean {
    return SPOTIFY_URL.test(url);
  }

  public async resolve(
    query: string,
    options?: XiaoSearchOptions,
  ): Promise<XiaoSearchResult> {
    const spotifyUrl = SPOTIFY_URL.exec(query);

    if (spotifyUrl) {
      const [, type, id] = spotifyUrl;

      switch (type) {
        case 'track':
          return this.getTrack(id, options?.requester);
        case 'playlist':
          return this.getPlaylist(id, options?.requester);
      }
    }

    return {
      tracks: [],
      type: LoadType.NO_MATCHES,
    };
  }

  public async search(
    query: string,
    requester?: User,
  ): Promise<XiaoSearchResult> {
    const searchLimit = Math.min(this.options.limits.search, 15);
    const encodedQuery = encodeURIComponent(query);
    const endpoint = `/search?q=${encodedQuery}&type=track&limit=${searchLimit}&market=${this.options.region}`;
    const resolved = await this.requestManager.request<SpotifySearchResponse>(
      endpoint,
    );

    if (!resolved || !resolved.tracks || resolved.tracks?.items?.length === 0) {
      return {
        tracks: [],
        type: LoadType.NO_MATCHES,
      };
    }

    return {
      tracks: resolved.tracks.items.map((item) => this.parseTrack(item, requester)),
      type: LoadType.SEARCH_RESULT,
    };
  }

  public async getPlaylist(
    id: string,
    requester?: User,
  ): Promise<XiaoSearchResult> {
    const playlist = await this.requestManager.request<SpotifyPlaylistResponse>(
      `/playlists/${id}?market=${this.options.region}`,
    );

    const tracks = playlist?.tracks?.items
      .filter(Boolean)
      .map((item) => this.parseTrack(item.track, requester));

    if (!playlist || tracks.length === 0) {
      return {
        tracks: [],
        type: LoadType.NO_MATCHES,
      };
    }

    let { next } = playlist.tracks;
    let page = 1;

    while (next && page < this.options.limits.playlists) {
      const nextTracks = await this.requestManager.request<PlaylistTracks>(
        next,
        true,
      );

      if (nextTracks.items.length === 0) {
        break;
      }

      next = nextTracks.next;
      page++;

      const filteredTracks = nextTracks.items
        .filter((x) => !!x && x.track)
        .map((item) => this.parseTrack(item.track, requester));

      tracks.push(...filteredTracks);
    }

    return {
      tracks,
      playlistName: playlist.name,
      type: LoadType.PLAYLIST_LOADED,
    };
  }

  public async validate(url: string): Promise<{
    type: LoadType;
    playlistName?: string;
    amount?: number;
  }> {
    const spotifyUrl = SPOTIFY_URL.exec(url);

    if (!spotifyUrl) {
      return {
        type: LoadType.NO_MATCHES,
      };
    }

    const [, type, id] = spotifyUrl;

    if (type !== 'playlist') {
      throw new Error('Invalid type');
    }

    const playlist = await this.requestManager.request<SpotifyPlaylistResponse>(
      `/playlists/${id}?market=${this.options.region}`,
    );

    const tracks = playlist?.tracks?.items
      .filter(Boolean)
      .map((item) => this.parseTrack(item.track));

    if (!playlist || tracks.length === 0) {
      return {
        type: LoadType.NO_MATCHES,
      };
    }

    return {
      playlistName: playlist.name,
      type: LoadType.PLAYLIST_LOADED,
      amount: playlist.tracks.total,
    };
  }

  public async getTrack(
    id: string,
    requester?: User,
  ): Promise<XiaoSearchResult> {
    const response = await this.requestManager.request<SpotifyTrackResponse>(
      `/tracks/${id}`,
    );

    if (!response) {
      return {
        tracks: [],
        type: LoadType.NO_MATCHES,
      };
    }

    return {
      tracks: [this.parseTrack(response, requester)],
      type: LoadType.TRACK_LOADED,
    };
  }

  private parseTrack(
    spotifyTrack: SpotifyTrackResponse,
    requester?: User,
    thumbnail?: string,
  ) {
    console.log(`[SPOTIFY] ${spotifyTrack.name} - ${requester?.tag}`);

    return new ResolvableTrack(
      {
        track: '',
        info: {
          sourceName: 'spotify',
          title: spotifyTrack.name,
          identifier: spotifyTrack.id,
          author: spotifyTrack.artists[0]
            ? spotifyTrack.artists[0].name
            : 'Unknown',
          length: spotifyTrack.duration_ms,
          isSeekable: true,
          isStream: false,
          position: 0,
          uri: `https://open.spotify.com/track/${spotifyTrack.id}`,
        },
        thumbnail: thumbnail ?? spotifyTrack.album?.images[0]?.url ?? '',
      },
      { requester },
    );
  }
}
