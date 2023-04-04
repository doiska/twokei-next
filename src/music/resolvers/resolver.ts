import { LoadType, XiaoSearchResult } from '../interfaces/player.types';
import { ResolvableTrack } from '../managers/ResolvableTrack';

export interface TrackResolver {
  name: string;

  resolve(query: string): Promise<XiaoSearchResult>;

  matches(url: string): boolean;

  getPlaylist(id: string): Promise<XiaoSearchResult>

  getTrack(id: string): Promise<XiaoSearchResult>

  validate(id: string): Promise<{
    type: LoadType;
    playlistName?: string;
    amount?: number;
  }>
}