import { XiaoEvents } from '../controllers/Xiao';
import { Events } from '../interfaces/player.types';
import { Twokei } from '../../app/Twokei';

export const playerDestroy: XiaoEvents[Events.PlayerDestroy] = ({ guildId }) => {
  Twokei.xiao.embedManager.destroy(guildId);
}