import { Twokei } from '../../app/Twokei';
import { XiaoEvents } from '../controllers/Xiao';
import { Events } from '../interfaces/player.types';

export const playerDestroy: XiaoEvents[Events.PlayerDestroy] = ({ guildId }) =>
  Twokei.xiao.embedManager.destroy(guildId);