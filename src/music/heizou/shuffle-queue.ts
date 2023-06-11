import { FriendlyException } from '../../structures/exceptions/FriendlyException';
import { Twokei } from '../../app/Twokei';
import { GuildMember } from 'discord.js';
import { isConnectedTo } from '../../preconditions/vc-conditions';

export const shuffleQueue = async (member: GuildMember): Promise<void> => {
  const player = await Twokei.xiao.getPlayer(member.guild.id);

  if (!player) {
    throw new FriendlyException('No player found');
  }

  if(!isConnectedTo(member, player.voiceId!)) {
    throw new FriendlyException('error.not-in-vc');
  }

  player.queue.shuffle();
}