import { logger } from "@/lib/logger";
import type { Venti } from "@/music/controllers/Venti";
import { createDefaultEmbed, createSongEmbed } from "@/music/embed/pieces";
import type { XiaoEvents } from "../../controllers/Xiao";
import { type Events } from "../../interfaces/player.types";

export async function reset(venti: Venti) {
  await venti.embedMessage
    ?.edit(await createDefaultEmbed(venti.guild))
    .catch((err) => {
      logger.error(err);
    });
}

export async function refresh(venti: Venti) {
  const message = venti.embedMessage;

  if (!message) {
    logger.error("No embed message found");
    return;
  }

  await message.edit(await createSongEmbed(venti));
}

export const manualUpdate: XiaoEvents[Events.ManualUpdate] = (venti) => {
  void refresh(venti);
};
