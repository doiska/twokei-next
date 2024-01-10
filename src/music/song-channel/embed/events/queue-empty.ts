import { container } from "@sapphire/framework";

import { logger } from "@/lib/logger";
import type { Venti } from "@/music/controllers/Venti";

export async function handlePlayerDestroyed(venti: Venti) {
  logger.info(`Player destroyed in ${venti.guild.name}, resetting...`);
  await container.sc.reset(venti.guild);
}

export async function handleEmptyQueue(venti: Venti) {
  logger.info(`Queue empty in ${venti.guild.name}, resetting...`);

  await container.sc.reset(venti.guild);
  await container.xiao.destroyPlayer(venti.guild, "Queue empty");
}
