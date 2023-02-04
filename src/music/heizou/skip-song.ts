import { GuildResolvable, Snowflake } from 'discord.js';
import { PlayerException } from '../../exceptions/PlayerException';
import { Twokei } from '../../app/Twokei';
import { FriendlyException } from '../../exceptions/FriendlyException';

export const skipSong = async (guild: GuildResolvable, amount = 1) => {
  const player = await Twokei.xiao.getPlayer(guild);

  if (!player) {
    throw new FriendlyException('No player found');
  }

  if(isNaN(amount)) {
    throw new FriendlyException('Amount is not a number');
  }

  return player.skip(amount);
}