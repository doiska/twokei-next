import { container } from '@sapphire/framework';

import { reset } from '@/music/embed/events/manual-update';

import { type Events } from '../../interfaces/player.types';
import type { XiaoEvents } from '../../controllers/Xiao';

export const playerDestroy: XiaoEvents[Events.PlayerDestroy] = () => {
  // container.xiao.embedManager.destroy(guildId);
};

export const queueEmpty: XiaoEvents[Events.QueueEmpty] = (venti) => {
  reset(venti)
    .then(async () => {
      await container.xiao.destroyPlayer(venti.guild);
    })
    .catch((error) => {
      container.logger.error(error);
    });
};
