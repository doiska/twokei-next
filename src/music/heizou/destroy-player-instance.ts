import { GuildMember } from 'discord.js';
import { Twokei } from '../../app/Twokei';
import { isConnectedTo } from '../../preconditions/vc-conditions';
import { FriendlyException } from '../../structures/exceptions/FriendlyException';

export const destroyPlayerInstance = async (member: GuildMember) => {

  const player = Twokei.xiao.getPlayer(member.guild.id);

  if (player?.voiceId && !isConnectedTo(member, player.voiceId)) {
    throw new FriendlyException('error.not-in-vc');
  }

  return Twokei.xiao.destroyPlayer(member);
}