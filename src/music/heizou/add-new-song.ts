import { EmbedBuilder, type GuildMember } from "discord.js";
import {
  canJoinVoiceChannel,
  isVoiceChannel,
} from "@sapphire/discord.js-utilities";

import { isConnectedTo } from "@/preconditions/vc-conditions";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { PlayerException } from "@/structures/exceptions/PlayerException";
import { Events, XiaoLoadType } from "../interfaces/player.types";
import { createPlayerInstance } from "./create-player-instance";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";
import { container } from "@sapphire/framework";
import { logger, playerLogger } from "@/lib/logger";
import { Icons } from "@/constants/icons";
import { dispose } from "@/lib/message-handler/utils";

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

  return await createPlayerInstance({
    guild,
    voiceChannel: member.voice.channel.id,
  });
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

  const addedTracks =
    result.type === XiaoLoadType.PLAYLIST_LOADED
      ? result.tracks
      : [result.tracks?.[0]];

  player.queue.add(...addedTracks);

  if (!player.playing) {
    await player.play();
  }

  player.emit(Events.TrackAdd, player, result, member);
  return result;
}
