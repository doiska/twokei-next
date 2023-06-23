import { Twokei } from '../../app/Twokei';
import { XiaoEvents } from '../controllers/Xiao';
import { Events } from '../interfaces/player.types';

export const queueEmpty: XiaoEvents[Events.QueueEmpty] = (venti) =>
  Twokei.xiao.destroyPlayer(venti.guildId);