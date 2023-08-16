import type { Guild } from 'discord.js';

import type { Venti } from '@/music/controllers/Venti';
import { createDynamicButtons, createStaticButtons } from '@/music/embed/pieces/buttons';
import { createDefaultSongEmbed } from '@/music/embed/pieces/embed';
import { createSelectMenu } from '@/music/embed/pieces/menu';

export async function createDefaultEmbed (guild: Guild) {
  return {
    embeds: [await createDefaultSongEmbed(guild)],
    components: [await createStaticButtons(guild)],
  };
}

export async function createSongEmbed (venti: Venti) {
  const [
    newEmbed,
    staticButtons,
    {
      primary,
      secondary,
    },
  ] = await Promise.all([
    createDefaultSongEmbed(venti.guild),
    createStaticButtons(venti.guild),
    createDynamicButtons(venti),
  ]);

  const menu = createSelectMenu(venti.queue);

  return {
    embeds: [newEmbed],
    components: [staticButtons, primary, secondary, menu],
  };
}
