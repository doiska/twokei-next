import { type GuildMember } from 'discord.js';

import { FriendlyException } from '@/structures/exceptions/FriendlyException';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { isConnectedTo } from '@/preconditions/vc-conditions';
import { xiao } from '@/app/Xiao';

export const destroyPlayerInstance = async (member: GuildMember) => {
  const player = xiao.getPlayer(member.guild.id);

  if (player?.voiceId && !isConnectedTo(member, player.voiceId)) {
    throw new FriendlyException(ErrorCodes.NOT_IN_VC);
  }

  await xiao.destroyPlayer(member.guild);
};
