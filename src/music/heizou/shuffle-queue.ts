import { GuildMember } from 'discord.js';

import { xiao } from '../../app/Xiao';
import { isConnectedTo } from '../../preconditions/vc-conditions';
import { FriendlyException } from '../../structures/exceptions/FriendlyException';

export const shuffleQueue = async (member: GuildMember): Promise<void> => {
  const player = await xiao.getPlayer(member.guild.id);

  if (!player) {
    throw new FriendlyException('No player found');
  }

  if (!isConnectedTo(member, player?.voiceId)) {
    throw new FriendlyException('error.not-in-vc');
  }

  player.queue.shuffle();
};
