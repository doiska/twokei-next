import type { Guild } from 'discord.js';
import { createDefaultSongEmbed } from '@/music/embed/pieces/embed';
import { createDynamicButtons, createStaticButtons } from '@/music/embed/pieces/buttons';
import { createSelectMenu } from '@/music/embed/pieces/menu';
import type { Venti } from '@/music/controllers/Venti';

export async function createDefaultEmbed (guild: Guild) {
  return {
    embed: [await createDefaultSongEmbed(guild)],
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
    embed: [newEmbed],
    components: [staticButtons, primary, secondary, menu],
  };
}
