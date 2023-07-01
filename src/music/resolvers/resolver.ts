import {
  LoadType,
  XiaoSearchOptions,
  XiaoSearchResult,
} from '../interfaces/player.types';

export interface TrackResolver {
  name: string;

  resolve(
    query: string,
    options?: XiaoSearchOptions
  ): Promise<XiaoSearchResult>;

  matches(url: string): boolean;

  getPlaylist(id: string): Promise<XiaoSearchResult>;

  getTrack(id: string): Promise<XiaoSearchResult>;

  validate(id: string): Promise<{
    type: LoadType;
    playlistName?: string;
    amount?: number;
  }>;
}
