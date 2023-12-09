import { logger } from "@/lib/logger";
import type { Venti } from "@/music/controllers/Venti";
import { createDefaultEmbed, createSongEmbed } from "@/music/embed/pieces";
import type { XiaoEvents } from "../../controllers/Xiao";
import { type Events } from "../../interfaces/player.types";
import { container } from "@sapphire/framework";

export async function reset(venti: Venti) {
  const songChannel = await container.sc.getEmbed(venti.guild);

  if (!songChannel?.message) {
    logger.error("No song channel found");
    return;
  }

  await songChannel.message.edit(await createDefaultEmbed(venti.guild));
}

export async function refresh(venti: Venti) {
  const songChannel = await container.sc.getEmbed(venti.guild);

  if (!songChannel) {
    logger.error("No embed message found");
    return;
  }

  await songChannel.message.edit(await createSongEmbed(venti));
}
