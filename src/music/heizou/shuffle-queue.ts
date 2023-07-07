import { GuildMember } from 'discord.js';
import { container } from '@sapphire/framework';

import { PlayerException } from '@/structures/exceptions/PlayerException';
import { FriendlyException } from '@/structures/exceptions/FriendlyException';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { isConnectedTo } from '@/preconditions/vc-conditions';

export const shuffleQueue = async (member: GuildMember): Promise<void> => {
  const player = await container.xiao.getPlayer(member.guild.id);

  if (!player) {
    throw new FriendlyException('No player found');
  }

  if (!isConnectedTo(member, player?.voiceId)) {
    throw new PlayerException(ErrorCodes.NOT_IN_VC);
  }

  player.queue.shuffle();
};
