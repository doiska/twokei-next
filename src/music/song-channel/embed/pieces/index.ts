import type { BaseMessageOptions, Guild } from "discord.js";

import type { Venti } from "@/music/controllers/Venti";
import {
  createDynamicButtons,
  createStaticButtons,
} from "@/music/song-channel/embed/pieces/buttons";
import { createDefaultSongEmbed } from "@/music/song-channel/embed/pieces/embed";
import { createSelectMenu } from "@/music/song-channel/embed/pieces/menu";
import { getPresetMenu } from "@/music/song-channel/embed/pieces/preset-menu";

export async function createDefaultEmbed(
  guild: Guild,
): Promise<BaseMessageOptions> {
  const [newEmbed, staticRow, presetMenu] = await Promise.all([
    createDefaultSongEmbed(guild),
    createStaticButtons(guild),
    getPresetMenu(guild),
  ]);

  return {
    embeds: [newEmbed],
    components: [staticRow, presetMenu],
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
