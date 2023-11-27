import { type User } from "discord.js";

import {
  XiaoLoadType,
  type XiaoSearchOptions,
  type XiaoSearchResult,
} from "../../interfaces/player.types";
import { ResolvableTrack } from "../../structures/ResolvableTrack";
import { type TrackResolver } from "../resolver";
import { spotifyRequestManager } from "./spotify-request-manager";
import { type PlaylistTracks } from "./types/spotify.types";
import type {
  SpotifyPlaylistResponse,
  SpotifySearchResponse,
  SpotifyTrackResponse,
} from "./types/spotify-response.types";

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

const SPOTIFY_URL =
  /(?:https?:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|album|artist)[/:]([A-Za-z0-9]+)/;

class SpotifyTrackResolver implements TrackResolver {
  readonly name = "spotify";

  private readonly options: SpotifyResolverOptions;

  constructor() {
    this.options = spotifyRequestManager.options;
  }

  public matches(url: string) {
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
        case "track":
          return await this.track(id, options?.requester);
        case "playlist":
          return await this.playlist(id, options?.requester);
      }
    } else {
      return this.search(query, options?.requester);
    }

    return {
      tracks: [],
      type: XiaoLoadType.NO_MATCHES,
    };
  }

  public async search(
    query: string,
    requester?: User,
    limit = 1,
  ): Promise<XiaoSearchResult> {
    const encodedQuery = encodeURIComponent(query);
    const endpoint = `/search?q=${encodedQuery}&type=track&limit=${limit}&market=${this.options.region}`;

    const resolved =
      await spotifyRequestManager.request<SpotifySearchResponse>(endpoint);

    if (!resolved?.tracks || resolved.tracks?.items?.length === 0) {
      return {
        tracks: [],
        type: XiaoLoadType.NO_MATCHES,
      };
    }

    return {
      tracks: resolved.tracks.items.map((item) =>
        this.parseTrack(item, requester),
      ),
      type: XiaoLoadType.SEARCH_RESULT,
    };
  }

  public async playlist(
    id: string,
    requester?: User,
  ): Promise<XiaoSearchResult> {
    const playlist =
      await spotifyRequestManager.request<SpotifyPlaylistResponse>(
        `/playlists/${id}?market=${this.options.region}`,
      );

    const tracks = playlist?.tracks?.items
      .filter(Boolean)
      .map((item) => this.parseTrack(item.track, requester));

    if (!playlist || tracks.length === 0) {
      return {
        tracks: [],
        type: XiaoLoadType.NO_MATCHES,
      };
    }

    let { next } = playlist.tracks;
    let page = 1;

    while (next && page < this.options.limits.playlists) {
      const nextTracks = await spotifyRequestManager.request<PlaylistTracks>(
        next,
        true,
      );

      if (nextTracks.items.length === 0) {
        break;
      }

      next = nextTracks.next;
      page += 1;

      const filteredTracks = nextTracks.items
        .filter((x) => !!x && x.track)
        .map((item) => this.parseTrack(item.track, requester));

      tracks.push(...filteredTracks);
    }

    return {
      tracks,
      playlist: {
        name: playlist.name,
        url: playlist.href,
        owner: {
          name: playlist.owner.display_name,
          url: playlist.owner.href,
        },
      },
      type: XiaoLoadType.PLAYLIST_LOADED,
    };
  }

  public async track(id: string, requester?: User): Promise<XiaoSearchResult> {
    const response = await spotifyRequestManager.request<SpotifyTrackResponse>(
      `/tracks/${id}`,
    );

    if (!response) {
      return {
        tracks: [],
        type: XiaoLoadType.NO_MATCHES,
      };
    }

    return {
      tracks: [this.parseTrack(response, requester)],
      type: XiaoLoadType.TRACK_LOADED,
    };
  }

  private parseTrack(spotifyTrack: SpotifyTrackResponse, requester?: User) {
    const thumbnail =
      spotifyTrack.images?.[0].url ?? spotifyTrack.album?.images[0]?.url;

    return new ResolvableTrack(
      {
        encoded: "",
        info: {
          sourceName: "spotify",
          title: spotifyTrack.name,
          identifier: spotifyTrack.id,
          author: spotifyTrack.artists[0]
            ? spotifyTrack.artists[0].name
            : "Unknown",
          duration: spotifyTrack.duration_ms,
          isSeekable: true,
          isStream: false,
          position: 0,
          uri: `https://open.spotify.com/track/${spotifyTrack.id}`,
        },
        thumbnail: thumbnail ?? "",
        isrc: spotifyTrack.external_ids.isrc,
      },
      { requester },
    );
  }
}

export const spotifyTrackResolver = new SpotifyTrackResolver();
