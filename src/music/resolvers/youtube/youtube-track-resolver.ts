import { type User } from "discord.js";
import { container } from "@sapphire/framework";
import type { Track } from "shoukaku";

import type {
  XiaoSearchOptions,
  XiaoSearchResult,
} from "@/music/interfaces/player.types";
import { XiaoLoadType } from "@/music/interfaces/player.types";
import { type TrackResolver } from "@/music/resolvers/resolver";
import { ResolvableTrack } from "@/music/structures/ResolvableTrack";

export class YoutubeTrackResolver implements TrackResolver {
  readonly name = "youtube";

  // eslint-disable-next-line prefer-regex-literals
  readonly YOUTUBE_REGEX = new RegExp(
    "^(https?://)?(www\\.)?(youtube\\.com|youtu\\.?be|music\\.youtube\\.com)/.+$",
  );

  public async resolve(
    query: string,
    options: XiaoSearchOptions | undefined,
  ): Promise<XiaoSearchResult> {
    const node = container.xiao.shoukaku.getIdealNode();

    if (!node) {
      throw new Error("No node setup.");
    }

    const ytResponse = await node.rest.resolve(query);

    if (
      !ytResponse ||
      ytResponse.loadType === XiaoLoadType.NO_MATCHES ||
      ytResponse.loadType === XiaoLoadType.LOAD_FAILED ||
      !ytResponse.data
    ) {
      return {
        type: XiaoLoadType.NO_MATCHES,
        tracks: [],
      };
    }

    if (ytResponse.loadType === XiaoLoadType.TRACK_LOADED) {
      return {
        tracks: [this.parseTrack(ytResponse.data, options?.requester)],
        type: XiaoLoadType.TRACK_LOADED,
      };
    }

    if (ytResponse.loadType === XiaoLoadType.PLAYLIST_LOADED) {
      return {
        tracks: ytResponse.data.tracks.map((track) =>
          this.parseTrack(track, options?.requester),
        ),
        type: XiaoLoadType.PLAYLIST_LOADED,
        playlist: {
          name: ytResponse.data.info.name ?? "Playlist",
          url: query,
        },
      };
    }

    return {
      tracks: ytResponse.data.map((track) =>
        this.parseTrack(track, options?.requester),
      ),
      type: XiaoLoadType.SEARCH_RESULT,
    };
  }

  public matches(url: string) {
    return this.YOUTUBE_REGEX.test(url);
  }

  private parseTrack(track: Track, requester?: User) {
    return new ResolvableTrack(
      {
        encoded: "",
        info: {
          sourceName: "youtube",
          title: track.info.title,
          identifier: track.info.identifier,
          author: track.info.author ?? "Unknown",
          length: track.info.length,
          isSeekable: true,
          isStream: false,
          position: 0,
          uri: track.info.uri,
        },
        thumbnail: `https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`,
      },
      { requester },
    );
  }
}

export const youtubeTrackResolver = new YoutubeTrackResolver();
