import { canJoinVoiceChannel, isVoiceChannel } from '@sapphire/discord.js-utilities';
import { GuildMember } from 'discord.js';

import { xiao } from '@/app/Xiao';
import { isConnectedTo } from '@/preconditions/vc-conditions';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { PlayerException } from '@/structures/exceptions/PlayerException';

import { Events } from '../interfaces/player.types';
import { createPlayerInstance } from './create-player-instance';

export async function addNewSong(input: string, member: GuildMember) {
  const { guild } = member;

  if (!guild || !member || !member?.guild) {
    throw new PlayerException(ErrorCodes.UNKNOWN);
  }

  if (!input) {
    throw new PlayerException(ErrorCodes.PLAYER_MISSING_INPUT);
  }

  if (!isVoiceChannel(member.voice.channel)) {
    throw new PlayerException(ErrorCodes.NOT_IN_VC);
  }

  const currentVoiceId = xiao.getPlayer(guild.id)?.voiceId;

  if (currentVoiceId && isConnectedTo(member, currentVoiceId)) {
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

  const result = await xiao.search(input, { requester: member.user });

  if (!result.tracks.length) {
    throw new PlayerException(ErrorCodes.PLAYER_NO_TRACKS_FOUND);
  }

  player.queue.add(...result.tracks);

  if (!player.playing) {
    await player.play();
  } else {
    player.emit(Events.TrackAdd, player, result.tracks);
  }

  return result;
}
