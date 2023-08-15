import type {
  Album,
  Artist,
  ExternalUrls,
  Followers, Image, PlaylistTracks,
  SpotifyTrack,
} from '@/music/resolvers/spotify/types/spotify.types';

export interface SpotifyPlaylistResponse {
  collaborative: boolean
  description: string
  external_urls: ExternalUrls
  followers: Followers
  href: string
  id: string
  images: Image[]
  name: string
  owner: {
    display_name: string
    external_urls: ExternalUrls
    href: string
    id: string
    type: string
    uri: string
    followers: {
      total: number
      href: string
    }
  }
  primary_color: string | null
  public: boolean
  snapshot_id: string
  tracks: PlaylistTracks
  type: string
  uri: string
}

export interface SpotifySearchResponse {
  tracks: {
    href: string
    next?: string | null
    items: SpotifyTrack[]
    limit?: number
    offset?: number
    previous?: string | null
    total?: number
  }
}

export interface SpotifyProfileResponse {
  href: string
  items: SpotifyPlaylistResponse[]
  limit: number
  total: number
  previous: string | null
  next: string | null
}

export interface SpotifyTrackResponse {
  album?: Album
  artists: Artist[]
  available_markets: string[]
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_urls: ExternalUrls
  href: string
  id: string
  is_local: boolean
  name: string
  preview_url: string
  track_number: number
  type: string
  uri: string
}
