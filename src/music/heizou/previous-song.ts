import { GuildResolvable } from 'discord.js';

import { Twokei } from '../../app/Twokei';
import { FriendlyException } from '../../structures/exceptions/FriendlyException';

export const previousSong = async (guild: GuildResolvable): Promise<void> => {
  const player = await Twokei.xiao.getPlayer(guild);

  if (!player) {
    throw new FriendlyException('No player found');
  }

  if (!player.queue.previous) {
    throw new FriendlyException('No previous song found');
  }

  player.play(player.queue.previous, { replace: true });
};