import { type GuildMember, PermissionsBitField } from "discord.js";
import {
  canJoinVoiceChannel,
  isVoiceChannel,
} from "@sapphire/discord.js-utilities";

import { isConnectedTo } from "@/music/utils/vc-conditions";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { PlayerException } from "@/structures/exceptions/PlayerException";
import { Events, XiaoLoadType } from "../interfaces/player.types";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";
import { container } from "@sapphire/framework";

export async function addNewSong(input: string, member: GuildMember) {
  if (!member || !member?.guild) {
    throw new PlayerException(ErrorCodes.UNKNOWN);
  }

  const voiceChannel = member.voice.channel;
  if (!voiceChannel || !isVoiceChannel(voiceChannel)) {
    throw new PlayerException(ErrorCodes.NOT_IN_VC);
  }

  const currentPermissions = voiceChannel.permissionsFor(
    member.guild.members.me!,
  );

  if (!currentPermissions.has(PermissionsBitField.Flags.ViewChannel)) {
    throw new PlayerException(ErrorCodes.MISSING_PERMISSIONS_VIEW_VC);
  }

  if (!currentPermissions.has(PermissionsBitField.Flags.Connect)) {
    throw new PlayerException(ErrorCodes.MISSING_PERMISSIONS_JOIN_VC);
  }

  if (!currentPermissions.has(PermissionsBitField.Flags.Speak)) {
    throw new PlayerException(ErrorCodes.MISSING_PERMISSIONS_SPEAK_VC);
  }

  const currentVoiceId = container.xiao.getPlayer(member.guild.id)?.voiceId;
  if (currentVoiceId && !isConnectedTo(member, currentVoiceId)) {
    throw new PlayerException(ErrorCodes.NOT_SAME_VC);
  }

  const result = await container.xiao.search(input, {
    requester: member.user,
    resolver: "spotify",
  });

  if (!result.tracks.length) {
    throw new FriendlyException(ErrorCodes.PLAYER_NO_TRACKS_FOUND);
  }

  const player = await container.xiao.createPlayer({
    guild: voiceChannel.guild,
    voiceChannel: voiceChannel.id,
    shardId: voiceChannel.guild.shardId,
    deaf: true,
  });

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
