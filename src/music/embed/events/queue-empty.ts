import { container } from "@sapphire/framework";

import { logger, playerLogger } from "@/lib/logger";
import type { Venti } from "@/music/controllers/Venti";
import { reset } from "@/music/embed/events/manual-update";

export function playerDestroyed(venti: Venti) {
  logger.info(`Player destroyed in ${venti.guild.name}, resetting...`);

  reset(venti).catch((error) => {
    playerLogger.error(error);
  });
}

export const queueEmpty = (venti: Venti) => {
  logger.info(`Queue empty in ${venti.guild.name}, resetting...`);

  reset(venti)
    .then(async () => {
      await container.xiao.destroyPlayer(venti.guild, "Queue empty");
    })
    .catch((error) => {
      playerLogger.error(error);
    });
};
