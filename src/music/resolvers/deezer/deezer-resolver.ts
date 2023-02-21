import { TrackResolver } from '../resolver';
import { XiaoSearchResult } from '../../interfaces/player.types';

export class DeezerResolver implements TrackResolver {
  public name = 'deezer';

  public matches(url: string): boolean {
    return false;
  }

  public resolve(query: string): Promise<XiaoSearchResult> {
    throw new Error('Method not implemented.');
  }
}