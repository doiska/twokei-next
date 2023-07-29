import { container } from '@sapphire/framework';

import { reset } from '@/music/embed/events/manual-update';

import type { Venti } from '@/music/controllers/Venti';
import { playerLogger } from '@/modules/logger-transport';

export const queueEmpty = (venti: Venti) => {
  reset(venti)
    .then(async () => {
      await container.xiao.destroyPlayer(venti.guild);
    })
    .catch((error) => {
      playerLogger.error(error);
    });
};
