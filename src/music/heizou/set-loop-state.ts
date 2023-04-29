import { GuildResolvable } from 'discord.js';
import { Twokei } from '../../app/Twokei';
import { LoopStates } from '../controllers/Venti';
import { FriendlyException } from '../../exceptions/FriendlyException';

export const setLoopState = async (guild: GuildResolvable, loopState?: LoopStates): Promise<LoopStates> => {

  const player = await Twokei.xiao.getPlayer(guild);

  if (!player) {
    throw new FriendlyException('No player found');
  }

  return player.setLoop(loopState);
}