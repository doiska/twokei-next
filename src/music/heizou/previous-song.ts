import { GuildResolvable } from 'discord.js';

import { FriendlyException } from '@/structures/exceptions/FriendlyException';
import { xiao } from '@/app/Xiao';

export const previousSong = async (guild: GuildResolvable): Promise<void> => {
  const player = await xiao.getPlayer(guild);

  if (!player) {
    throw new FriendlyException('No player found');
  }

  if (!player.queue.previous) {
    throw new FriendlyException('No previous song found');
  }

  player.play(player.queue.previous, { replace: true });
};
