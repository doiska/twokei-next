import { container } from '@sapphire/framework';

import { reset } from '@/music/events/manual-update';

import { Events } from '../interfaces/player.types';
import type { XiaoEvents } from '../controllers/Xiao';

export const playerDestroy: XiaoEvents[Events.PlayerDestroy] = () => {
  // container.xiao.embedManager.destroy(guildId);
};

export const queueEmpty: XiaoEvents[Events.QueueEmpty] = (venti) => {
  container.xiao.destroyPlayer(venti.guild);
  reset(venti);
};
