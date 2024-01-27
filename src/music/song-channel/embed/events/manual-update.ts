import { logger } from "@/lib/logger";
import type { Venti } from "@/music/controllers/Venti";
import { container } from "@sapphire/framework";
import { getComponents, getEmbed } from "@/music/song-channel/embed/pieces";
import { MessageEditOptions } from "discord.js";

interface Updatable {
  embed: boolean;
  components: boolean;
}

export async function refresh(
  venti: Venti,
  update: Partial<Updatable> = {
    components: true,
    embed: true,
  },
) {
  const songChannel = await container.sc.getEmbed(venti.guild);

  if (!songChannel) {
    logger.error("No embed message found");
    return;
  }

  const { components, embed } = update;
  const newMessage = {} as MessageEditOptions;

  if (components) {
    newMessage.components = await getComponents(venti);
  }

  if (embed) {
    newMessage.embeds = [await getEmbed(venti.guild)];
  }

  await songChannel.message.edit(newMessage);
}
