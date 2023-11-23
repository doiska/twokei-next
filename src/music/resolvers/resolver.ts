import {
  type XiaoSearchOptions,
  type XiaoSearchResult,
} from "../interfaces/player.types";

export interface TrackResolver {
  name: string;
  resolve: (
    query: string,
    options?: XiaoSearchOptions,
  ) => Promise<XiaoSearchResult>;

  matches: (url: string) => boolean;
}
