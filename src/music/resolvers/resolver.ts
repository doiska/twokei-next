import { type SpotifyProfileResponse } from '@/music/resolvers/spotify/spotify.types';
import {
  type XiaoSearchOptions,
  type XiaoSearchResult,
} from '../interfaces/player.types';

export interface TrackResolver {
  name: string
  resolve: (
    query: string,
    options?: XiaoSearchOptions
  ) => Promise<XiaoSearchResult>

  matches: (url: string) => boolean
  getPlaylist: (id: string) => Promise<XiaoSearchResult>
  getTrack: (id: string) => Promise<XiaoSearchResult>
}

interface Profile {
  displayName: string
  uri: string
}

export interface ProfileResolver {
  // getProfile: (profileId: string) => Promise<Profile>
  getPlaylists: (profileId: string) => Promise<SpotifyProfileResponse>
}
