import { GuildMember } from 'discord.js';
import { Twokei } from '../../app/Twokei';
import { LoopStates } from '../controllers/Venti';
import { FriendlyException } from '../../structures/exceptions/FriendlyException';
import { isConnectedTo } from '../../preconditions/vc-conditions';

export const setLoopState = async (member: GuildMember, loopState?: LoopStates): Promise<LoopStates> => {

  const player = await Twokei.xiao.getPlayer(member);

  if (!player) {
    throw new FriendlyException('No player found');
  }

  if(isConnectedTo(member, player.voiceId!)) {
    throw new FriendlyException('error.not-in-vc');
  }

  return player.setLoop(loopState);
}