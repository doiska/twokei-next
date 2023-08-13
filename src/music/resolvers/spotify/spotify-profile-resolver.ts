import type { ProfileResolver } from '@/music/resolvers/resolver';
import type { SpotifyProfileResponse } from '@/music/resolvers/spotify/spotify.types';
import { spotifyRequestManager } from '@/music/resolvers/spotify/spotify-request-manager';

export class SpotifyProfileResolver implements ProfileResolver {
  async getPlaylists (profileId: string) {
    return await spotifyRequestManager.request<SpotifyProfileResponse>(
      `/users/${profileId}/playlists`,
    );
  }
}

export const spotifyProfileResolver = new SpotifyProfileResolver();
