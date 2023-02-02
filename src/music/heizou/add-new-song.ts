import { isVoiceChannel } from '../../utils/discord-type-guards';
import { canJoinVoiceChannel } from '../../utils/discord-utilities';
import { Twokei } from '../../app/Twokei';
import { createPlayerInstance } from './create-player-instance';
import { PlayerException } from '../../structures/PlayerException';
import { GuildMember } from 'discord.js';
import { Events } from '../interfaces/player.types';

export async function addNewSong(input: string, member: GuildMember) {
  const guild = member.guild;

  if (!guild || !member || !member?.guild) {
    throw new PlayerException('No member or guild');
  }

  if (!input) {
    throw new PlayerException('No input provided');
  }

  if (!isVoiceChannel(member.voice.channel)) {
    throw new PlayerException('No voice channel');
  }

  if (!canJoinVoiceChannel(member.voice.channel)) {
    throw new PlayerException('I can\'t join your voice channel.');
  }

  const player = await createPlayerInstance({
    guild: guild,
    voiceChannel: member.voice.channel.id
  })

  if (!player) {
    throw new PlayerException('Player could not be created');
  }

  const result = await Twokei.xiao.search(input);

  if (!result.tracks.length) {
    throw new PlayerException('No tracks found');
  }

  player.queue.add(...result.tracks);

  if(!player.playing) {
    player.play();
  } else {
    player.emit(Events.TrackAdd, player, result.tracks);
  }

  return result.tracks;
}