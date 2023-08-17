import type { ProfileResolver, ProfileWithPlaylists } from '@/music/resolvers/resolver';
import { spotifyRequestManager } from '@/music/resolvers/spotify/spotify-request-manager';
import type { SpotifyProfileResponse } from '@/music/resolvers/spotify/types/spotify-response.types';

export class SpotifyProfileResolver implements ProfileResolver {
  async getPlaylists (profileId: string): Promise<ProfileWithPlaylists> {
    const response = await spotifyRequestManager.request<SpotifyProfileResponse>(
      `/users/${profileId}/playlists`,
    );

    return {
      userId: profileId,
      total: response.total,
      href: `https://open.spotify.com/user/${profileId}`,
      items: response.items.map(item => ({
        id: item.id,
        description: item.description,
        name: item.name,
        images: item.images,
        uri: item.external_urls.spotify,
        owner: {
          id: item.owner.id,
          name: item.owner.display_name,
          href: `https://open.spotify.com/user/${item.owner.id}`,
          followers: item.owner.followers?.total ?? 0,
        },
        tracks: item.tracks,
      })),
      source: 'spotify',
    };
  }
}

export const spotifyProfileResolver = new SpotifyProfileResolver();
