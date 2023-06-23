import { GuildMember } from 'discord.js';

import { Twokei } from '../../app/Twokei';
import { isConnectedTo } from '../../preconditions/vc-conditions';
import { FriendlyException } from '../../structures/exceptions/FriendlyException';

export const skipSong = async (member: GuildMember, amount = 1) => {
  const player = await Twokei.xiao.getPlayer(member);

  if (!player) {
    throw new FriendlyException('No player found.');
  }

  if(!isConnectedTo(member, player?.voiceId)) {
    throw new FriendlyException('error.not-in-vc');
  }

  if (isNaN(amount)) {
    throw new FriendlyException('Amount is not a number.');
  }

  if (player.queue.length < amount) {
    throw new FriendlyException('There are not enough songs in the queue.');
  }

  return player.skip(amount);
};