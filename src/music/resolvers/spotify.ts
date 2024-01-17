import { SpotifyApi, type Track } from "@spotify/web-api-ts-sdk";
import { env } from "@/app/env";
import { ResolvableTrack } from "@/music/structures/ResolvableTrack";
import { TrackInfo } from "@twokei/shoukaku";
import {
  XiaoLoadType,
  XiaoSearchResult,
} from "@/music/interfaces/player.types";
import { User } from "discord.js";

export const Spotify = SpotifyApi.withClientCredentials(
  env.SPOTIFY_CLIENT_ID,
  env.SPOTIFY_CLIENT_SECRET,
);

const SPOTIFY_URL =
  /(?:https?:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|album|artist)[/:]([A-Za-z0-9]+)/;

function getQueryId(query: string) {
  const match = SPOTIFY_URL.exec(query);

  if (!match) {
    return {
      type: "search",
      query,
    };
  }

  const [, type, id] = match;

  return {
    type,
    query: id,
  };
}

class SpotifyResolver {
  public readonly name = "spotify";

  public matches(url: string) {
    return SPOTIFY_URL.test(url);
  }

  public async resolve(
    query: string,
    requester?: User,
  ): Promise<XiaoSearchResult> {
    const { type, query: id } = getQueryId(query);
    const result = await this.resolveByType(type, id);

    return {
      ...result,
      tracks: result.tracks.map((track) =>
        this.parseToResolvableTrack(track, requester),
      ),
    };
  }

  private async resolveByType(type: string, id: string) {
    switch (type) {
      case "track":
        return this.getTrack(id);

      case "playlist":
        return this.getPlaylistTracks(id);

      case "album":
        return this.getAlbumTracks(id);

      default:
        return this.search(id);
    }
  }

  private async search(query: string) {
    const searchResult = await Spotify.search(query, ["track"]);

    return {
      type: XiaoLoadType.SEARCH_RESULT,
      tracks: searchResult.tracks.items,
    };
  }

  private async getTrack(trackId: string) {
    const track = await Spotify.tracks.get(trackId);

    return {
      type: XiaoLoadType.TRACK_LOADED,
      tracks: [track],
    };
  }

  private async getPlaylistTracks(playlistId: string) {
    const playlist = await Spotify.playlists.getPlaylist(playlistId);

    const tracks = playlist.tracks.items
      .map((item) => item.track)
      .filter((track) => track.type === "track") as Track[];

    return {
      type: XiaoLoadType.PLAYLIST_LOADED,
      tracks: tracks,
      playlist: {
        name: playlist.name,
        url: playlist.href,
      },
    };
  }

  private async getAlbumTracks(albumId: string) {
    const album = await Spotify.albums.get(albumId);

    if (!album) {
      return {
        type: XiaoLoadType.NO_MATCHES,
        tracks: [],
      };
    }

    const tracksId = album.tracks.items.map((item) => item.id);
    const tracks = await Spotify.tracks.get(tracksId);

    return {
      type: XiaoLoadType.PLAYLIST_LOADED,
      tracks: tracks,
      playlist: {
        name: album.name,
        url: album.href,
      },
    };
  }

  private parseToResolvableTrack(track: Track, requester?: User) {
    const trackInfo: TrackInfo = {
      identifier: track.id,
      title: track.name,
      uri: `https://open.spotify.com/track/${track.id}`,
      isrc: track.external_ids.isrc,
      artworkUrl: track.album?.images?.[0]?.url,
      author: track.artists.map((a) => a.name).join(", "),
      length: track.duration_ms,
      isStream: false,
      sourceName: "spotify",
      position: 0,
      isSeekable: true,
    };

    return new ResolvableTrack(
      {
        encoded: "",
        info: trackInfo,
      },
      {
        requester,
      },
    );
  }
}

export const spotifyResolver = new SpotifyResolver();
