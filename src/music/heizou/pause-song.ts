import { GuildResolvable } from 'discord.js';

import { xiao } from '../../app/Xiao';
import { FriendlyException } from '../../structures/exceptions/FriendlyException';

export const pauseSong = async (guild: GuildResolvable) => {
  const player = await xiao.getPlayer(guild);

  if (!player) {
    throw new FriendlyException('No player found');
  }

  if (!player.queue.current) {
    throw new FriendlyException('No song is currently playing');
  }

  player.pause();
};
