import { logger } from "@/lib/logger";
import type { Venti } from "@/music/controllers/Venti";
import { container } from "@sapphire/framework";
import { createSongEmbed } from "@/music/song-channel/embed/pieces";

interface Updatable {
  embed: boolean;
  components: boolean;
}

export async function refresh(venti: Venti, update?: Partial<Updatable>) {
  const songChannel = await container.sc.getEmbed(venti.guild);

  if (!songChannel) {
    logger.error("No embed message found");
    return;
  }

  const { embed, components } = update || {
    embed: true,
    components: true,
  };

  const { embeds: newEmbed, components: newComponents } =
    await createSongEmbed(venti);

  const newMessage = {
    embeds: embed ? newEmbed : undefined,
    components: components ? newComponents : undefined,
  };

  await songChannel.message.edit(newMessage);
}
