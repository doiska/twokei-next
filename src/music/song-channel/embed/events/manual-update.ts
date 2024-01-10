import { logger } from "@/lib/logger";
import type { Venti } from "@/music/controllers/Venti";
import { createSongEmbed } from "@/music/song-channel/embed/pieces";
import { container } from "@sapphire/framework";

export async function refresh(venti: Venti) {
  const songChannel = await container.sc.getEmbed(venti.guild);

  if (!songChannel) {
    logger.error("No embed message found");
    return;
  }

  await songChannel.message.edit(await createSongEmbed(venti));
}
