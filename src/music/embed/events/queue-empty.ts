import { container } from "@sapphire/framework";

import { playerLogger } from "@/lib/logger";
import type { Venti } from "@/music/controllers/Venti";
import { reset } from "@/music/embed/events/manual-update";

export const queueEmpty = (venti: Venti) => {
  reset(venti)
    .then(async () => {
      await container.xiao.destroyPlayer(venti.guild);
    })
    .catch((error) => {
      playerLogger.error(error);
    });
};
