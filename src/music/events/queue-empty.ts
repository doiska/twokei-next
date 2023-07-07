import { container } from '@sapphire/framework';

import { Events } from '../interfaces/player.types';
import type { XiaoEvents } from '../controllers/Xiao';

export const playerDestroy: XiaoEvents[Events.PlayerDestroy] = ({ guildId }) => {
  // container.xiao.embedManager.destroy(guildId);
};

export const queueEmpty: XiaoEvents[Events.QueueEmpty] = (venti) => {
  container.xiao.destroyPlayer(venti.guild);
};
