import type { Guild } from "discord.js";

import type { Venti } from "@/music/controllers/Venti";
import {
  createDynamicButtons,
  createStaticButtons,
} from "@/music/embed/pieces/buttons";
import { createDefaultSongEmbed } from "@/music/embed/pieces/embed";
import { createSelectMenu } from "@/music/embed/pieces/menu";

export async function createDefaultEmbed(guild: Guild) {
  const { primary, secondary } = await createStaticButtons(guild);

  return {
    embeds: [await createDefaultSongEmbed(guild)],
    components: [primary, secondary],
  };
}

export async function createSongEmbed(venti: Venti) {
  const [newEmbed, { primary: staticPrimary }, { primary, secondary }] =
    await Promise.all([
      createDefaultSongEmbed(venti.guild),
      createStaticButtons(venti.guild, venti),
      createDynamicButtons(venti),
    ]);

  const menu = createSelectMenu(venti.queue);

  return {
    embeds: [newEmbed],
    components: [staticPrimary, secondary, primary, menu],
  };
}
