import { GuildMember } from 'discord.js';

import { xiao } from '@/app/Xiao';
import { isConnectedTo } from '@/preconditions/vc-conditions';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { FriendlyException } from '@/structures/exceptions/FriendlyException';

export const destroyPlayerInstance = async (member: GuildMember) => {
  const player = xiao.getPlayer(member.guild.id);

  if (player?.voiceId && !isConnectedTo(member, player.voiceId)) {
    throw new FriendlyException(ErrorCodes.NOT_IN_VC);
  }

  return xiao.destroyPlayer(member);
};
