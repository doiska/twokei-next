import { GuildResolvable } from 'discord.js';
import { Twokei } from '../../app/Twokei';
import { FriendlyException } from '../../exceptions/FriendlyException';

export const skipSong = async (guild: GuildResolvable, amount = 1) => {
  const player = await Twokei.xiao.getPlayer(guild);

  if (!player) {
    throw new FriendlyException('No player found.');
  }

  if (isNaN(amount)) {
    throw new FriendlyException('Amount is not a number.');
  }

  if (player.queue.length < amount) {
    throw new FriendlyException('There are not enough songs in the queue.');
  }

  return player.skip(amount);
}