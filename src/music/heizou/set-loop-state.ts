import { Guild } from 'discord.js';
import { Twokei } from '../../app/Twokei';
import { LoopStates } from '../controllers/Venti';
import { FriendlyException } from '../../exceptions/FriendlyException';

export const setLoopState = async (guild: Guild, loopState?: LoopStates): Promise<LoopStates> => {

  const player = await Twokei.xiao.getPlayer(guild.id);

  if (!player) {
    throw new FriendlyException('No player found');
  }

  return player.setLoop(loopState);
}