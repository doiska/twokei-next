export interface SpotifyTrack {
    album?: Album;
    artists: Artist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_urls: ExternalUrls;
    href: string;
    id: string;
    is_local: boolean;
    name: string;
    preview_url: string;
    track_number: number;
    type: string;
    uri: string;
}

export interface Tracks {
    href: string;
    items: SpotifyTrack[];
    next: string | null;
}

export interface PlaylistTracks {
    href: string;
    items: SpecialTracks[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
}

export interface SpecialTracks {
    added_at: string;
    is_local: boolean;
    primary_color: string | null;
    track: SpotifyTrack;
}

export interface Copyright {
    text: string;
    type: string;
}

export interface ExternalUrls {
    spotify: string;
}

export interface ExternalIds {
    isrc: string;
}

export interface Album {
    album_type: string;
    artists: Artist[];
    available_markets: string[];
    external_urls: { [key: string]: string };
    href: string;
    id: string;
    images: Image[];
    name: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
    type: string;
    uri: string;
}

export interface Image {
    height: number;
    url: string;
    width: number;
}

export interface Artist {
    external_urls: {
        spotify: string;
    };
    followers: {
        href: string;
        total: number;
    };
    genres: [];
    href: string;
    id: string;
    images: Image[];
    name: string;
    popularity: number;
    type: string;
    uri: string;
}


export interface SpotifyTrackResponse {
    album?: Album;
    artists: Artist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_urls: ExternalUrls;
    href: string;
    id: string;
    is_local: boolean;
    name: string;
    preview_url: string;
    track_number: number;
    type: string;
    uri: string;
}

interface Owner {
    display_name: string;
    external_urls: ExternalUrls;
    href: string;
    id: string;
    type: string;
    uri: string;
}

export interface Followers {
    href: string | null;
    total: number;
}

export interface SpotifyPlaylistResponse {
    collaborative: boolean;
    description: string;
    external_urls: ExternalUrls;
    followers: Followers;
    href: string;
    id: string;
    images: Image[];
    name: string;
    owner: Owner;
    primary_color: string | null;
    public: boolean;
    snapshot_id: string;
    tracks: PlaylistTracks;
    type: string;
    uri: string;
}

export interface SpotifySearchResponse {
    tracks: {
        href: string;
        next?: string | null;
        items: SpotifyTrack[];
        limit?: number;
        offset?: number;
        previous?: string | null;
        total?: number;
    }
}