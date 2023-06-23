import { GuildMember } from 'discord.js';

import { isVoiceChannel } from '@sapphire/discord.js-utilities';

import { Twokei } from '../../app/Twokei';
import { isConnectedTo } from '../../preconditions/vc-conditions';
import { PlayerException } from '../../structures/exceptions/PlayerException';
import { canJoinVoiceChannel } from '../../utils/discord-utilities';
import { Events } from '../interfaces/player.types';
import { createPlayerInstance } from './create-player-instance';



export async function addNewSong(input: string, member: GuildMember) {
  const guild = member.guild;

  if (!guild || !member || !member?.guild) {
    throw new PlayerException('No member or guild');
  }

  if (!input) {
    throw new PlayerException('No input provided');
  }

  if (!isVoiceChannel(member.voice.channel)) {
    throw new PlayerException('You must be in a voice channel to use this command.');
  }

  const currentVoiceId = Twokei.xiao.getPlayer(guild.id)?.voiceId;

  console.log(currentVoiceId);

  if (currentVoiceId && isConnectedTo(member, currentVoiceId)) {
    throw new PlayerException('You must be in the same voice channel as me to use this command.');
  }

  if (!canJoinVoiceChannel(member.voice.channel)) {
    throw new PlayerException('I can\'t join your voice channel.');
  }

  const player = await createPlayerInstance({
    guild: guild,
    voiceChannel: member.voice.channel.id
  });

  if (!player) {
    throw new PlayerException('Failed to create player instance, please try again.');
  }

  const result = await Twokei.xiao.search(input, { requester: member.user });

  if (!result.tracks.length) {
    throw new PlayerException('No tracks found');
  }

  player.queue.add(...result.tracks);

  if (!player.playing) {
    await player.play();
  } else {
    player.emit(Events.TrackAdd, player, result.tracks);
  }

  return result;
}