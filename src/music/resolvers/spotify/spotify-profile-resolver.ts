import type { Playlist, ProfileResolver } from "@/music/resolvers/resolver";
import { spotifyRequestManager } from "@/music/resolvers/spotify/spotify-request-manager";
import { SpotifyPlaylistResponse } from "@/music/resolvers/spotify/types/spotify-response.types";

export class SpotifyProfileResolver implements ProfileResolver {
  async playlist(playlistId: string): Promise<Playlist> {
    const response =
      await spotifyRequestManager.request<SpotifyPlaylistResponse>(
        `/playlists/${playlistId}`,
      );

    return {
      id: response.id,
      name: response.name,
      description: response.description,
      href: response.external_urls.spotify,
      owner: {
        id: response.owner.id,
        name: response.owner.display_name,
        href: response.owner.external_urls.spotify,
      },
      images: response.images,
      tracks: {
        total: response.tracks.total,
        items: response.tracks.items.map((item) => ({
          name: item.track.name,
          href: item.track.external_urls.spotify,
          external: {
            isrc: item.track.external_ids.isrc,
          },
          ...(item.track.album && {
            album: {
              id: item.track.album?.id,
              name: item.track.album?.name,
              href: item.track.album?.external_urls.spotify,
              images: item.track.album?.images,
            },
          }),
          artists: item.track.artists.map((artist) => ({
            id: artist.id,
            name: artist.name,
            href: artist.external_urls.spotify,
          })),
          duration: item.track.duration_ms,
        })),
      },
      source: "spotify",
    };
  }
}

export const spotifyProfileResolver = new SpotifyProfileResolver();
