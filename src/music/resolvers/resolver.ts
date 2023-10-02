import {
  type XiaoSearchOptions,
  type XiaoSearchResult,
} from "../interfaces/player.types";

interface Image {
  url: string;
  height: number;
  width: number;
}

interface Profile {
  id: string;
  name: string;
  description?: string | null;
  href: string;
  followers?: number;
  images?: Image[];
}

export interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  href: string;
  owner?: {
    id: string;
    name: string;
    href: string;
  };
  images?: Image[];
  tracks: {
    total: number;
    items: Array<{
      name: string;
      href: string;
      external: {
        isrc?: string;
      };
      album?: {
        id: string;
        name: string;
        href: string;
        images?: Image[];
      };
      artists: {
        id: string;
        name: string;
        href: string;
      }[];
      duration: number;
    }>;
  };
  source: string;
}

export interface TrackResolver {
  name: string;
  resolve: (
    query: string,
    options?: XiaoSearchOptions,
  ) => Promise<XiaoSearchResult>;

  matches: (url: string) => boolean;
}

export interface ProfileResolver {
  // getProfile: (profileId: string) => Promise<Profile>
  playlist: (playlistId: string) => Promise<Playlist>;
}
