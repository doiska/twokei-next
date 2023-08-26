import {
  type XiaoSearchOptions,
  type XiaoSearchResult,
} from '../interfaces/player.types';

interface Image {
  url: string
  height: number
  width: number
}

interface Profile {
  id: string
  name: string
  description?: string | null
  href: string
  followers?: number
  images?: Image[]
}

export interface ProfileWithPlaylists {
  userId: string
  total: number
  href: string
  items: Array<{
    id: string
    description: string
    name: string
    owner: Profile
    uri: string
    tracks: {
      total: number
      href: string
    }
    images: Image[]
  }>
  source: string
}

export interface TrackResolver {
  name: string
  resolve: (
    query: string,
    options?: XiaoSearchOptions
  ) => Promise<XiaoSearchResult>

  matches: (url: string) => boolean
}

export interface ProfileResolver {
  // getProfile: (profileId: string) => Promise<Profile>
  getPlaylists: (profileId: string) => Promise<ProfileWithPlaylists>
}
