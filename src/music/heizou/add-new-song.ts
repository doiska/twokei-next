import { type GuildMember } from "discord.js";
import {
  canJoinVoiceChannel,
  isVoiceChannel,
} from "@sapphire/discord.js-utilities";

import { isConnectedTo } from "@/preconditions/vc-conditions";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { PlayerException } from "@/structures/exceptions/PlayerException";
import {
  Events,
  XiaoLoadType,
  XiaoSearchResult,
} from "../interfaces/player.types";
import { createPlayerInstance } from "./create-player-instance";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";
import { container } from "@sapphire/framework";
import { ResolvableTrack } from "@/music/structures/ResolvableTrack";
import { Playlist } from "@twokei/shoukaku";

async function createPlayer(member: GuildMember) {
  const { guild } = member;

  if (!guild || !member || !member?.guild) {
    throw new PlayerException(ErrorCodes.UNKNOWN);
  }

  if (!isVoiceChannel(member.voice.channel)) {
    throw new PlayerException(ErrorCodes.NOT_IN_VC);
  }

  const currentVoiceId = container.xiao.getPlayer(guild.id)?.voiceId;

  if (currentVoiceId && !isConnectedTo(member, currentVoiceId)) {
    throw new PlayerException(ErrorCodes.NOT_SAME_VC);
  }

  if (!canJoinVoiceChannel(member.voice.channel)) {
    throw new PlayerException(ErrorCodes.MISSING_PERMISSIONS_JOIN_VC);
  }

  const player = await createPlayerInstance({
    guild,
    voiceChannel: member.voice.channel.id,
  });

  if (!player) {
    throw new PlayerException(ErrorCodes.SOMETHING_WENT_REALLY_WRONG);
  }

  return player;
}

type Input =
  | string
  | ResolvableTrack
  | ResolvableTrack[]
  | {
      name: string;
      tracks: ResolvableTrack[];
    };

function getResult(input: Input, member?: GuildMember) {
  if (typeof input === "string") {
    return container.xiao.search(input, {
      requester: member?.user,
      resolver: "spotify",
    });
  }

  if (Array.isArray(input)) {
    return {
      tracks: input,
      type: XiaoLoadType.PLAYLIST_LOADED,
    };
  }

  return {
    tracks: input,
    type: XiaoLoadType.TRACK_LOADED,
  };
}

export async function addNewSong(input: string, member: GuildMember) {
  const player = await createPlayer(member);

  const result = await container.xiao.search(input, {
    requester: member.user,
    resolver: "spotify",
  });

  if (!result.tracks.length) {
    throw new FriendlyException(ErrorCodes.PLAYER_NO_TRACKS_FOUND);
  }

  const addedTracks = XiaoLoadType.PLAYLIST_LOADED
    ? result.tracks
    : [result.tracks?.[0]];

  player.queue.add(...addedTracks);

  if (!player.playing) {
    await player.play();
  }

  player.emit(Events.TrackAdd, player, result, member);

  return result;
}
