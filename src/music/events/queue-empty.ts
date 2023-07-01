import { xiao } from '../../app/Xiao';
import { XiaoEvents } from '../controllers/Xiao';
import { Events } from '../interfaces/player.types';

export const playerDestroy: XiaoEvents[Events.PlayerDestroy] = ({ guildId }) => xiao.embedManager.destroy(guildId);

export const queueEmpty: XiaoEvents[Events.QueueEmpty] = (venti) => xiao.destroyPlayer(venti.guildId);
