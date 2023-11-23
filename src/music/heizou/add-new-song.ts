import { type GuildMember } from "discord.js";
import {
  canJoinVoiceChannel,
  isVoiceChannel,
} from "@sapphire/discord.js-utilities";

import { isConnectedTo } from "@/preconditions/vc-conditions";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { PlayerException } from "@/structures/exceptions/PlayerException";
import { Events, XiaoLoadType } from "../interfaces/player.types";
import { createPlayerInstance } from "./create-player-instance";
import type { ResolvableTrack } from "@/music/structures/ResolvableTrack";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";
import { container } from "@sapphire/framework";

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

export async function addNewSong(input: string, member: GuildMember) {
  if (!input) {
    throw new PlayerException(ErrorCodes.PLAYER_MISSING_INPUT);
  }

  const player = await createPlayer(member);

  const result = await container.xiao.search(input, {
    requester: member.user,
    resolver: "spotify",
  });

  if (!result.tracks.length) {
    throw new FriendlyException(ErrorCodes.PLAYER_NO_TRACKS_FOUND);
  }

  if (result.type === XiaoLoadType.PLAYLIST_LOADED) {
    result.tracks.sort(() => Math.random() - 0.5);
    player.queue.add(...result.tracks);
  } else {
    player.queue.add(result.tracks?.[0]);
  }

  if (!player.playing) {
    await player.play();
  } else {
    player.emit(Events.TrackAdd, player, result.tracks);
  }

  return result;
}
