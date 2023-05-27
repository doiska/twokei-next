import { FriendlyException } from '../../structures/exceptions/FriendlyException';
import { Twokei } from '../../app/Twokei';
import { GuildResolvable } from 'discord.js';

export const shuffleQueue = async (guild: GuildResolvable): Promise<void> => {
  const player = await Twokei.xiao.getPlayer(guild);

  if (!player) {
    throw new FriendlyException('No player found');
  }

  player.queue.shuffle();
}