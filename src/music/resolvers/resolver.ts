import { XiaoSearchResult } from '../interfaces/player.types';

export interface TrackResolver {
  name: string;
  resolve(query: string): Promise<XiaoSearchResult>;
  matches(url: string): boolean;
}