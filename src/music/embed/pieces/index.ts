import type { Guild } from "discord.js";

import type { Venti } from "@/music/controllers/Venti";
import {
  createDynamicButtons,
  createStaticButtons,
} from "@/music/embed/pieces/buttons";
import { createDefaultSongEmbed } from "@/music/embed/pieces/embed";
import { createSelectMenu } from "@/music/embed/pieces/menu";
import { getPresetMenu } from "@/music/embed/pieces/preset-menu";

export async function createDefaultEmbed(guild: Guild) {
  return {
    embeds: [await createDefaultSongEmbed(guild)],
    components: [
      await createStaticButtons(guild),
      await getPresetMenu(guild),
    ].flat(),
  };
}

export async function createSongEmbed(venti: Venti) {
  const [newEmbed, staticRow, dynamicButtons] = await Promise.all([
    createDefaultSongEmbed(venti.guild),
    createStaticButtons(venti.guild),
    createDynamicButtons(venti),
  ]);

  const menu = createSelectMenu(venti.queue);

  return {
    embeds: [newEmbed],
    components: [staticRow, dynamicButtons, menu].flat(),
  };
}
