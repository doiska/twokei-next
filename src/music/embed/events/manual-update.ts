import {
  createDefaultSongEmbed,
  createSelectMenu,
} from '@/music/embed/pieces/create-song-embed';
import type { Venti } from '@/music/controllers/Venti';
import { logger } from '@/modules/logger-transport';

import { type Events } from '../../interfaces/player.types';
import type { XiaoEvents } from '../../controllers/Xiao';
import { createDynamicButtons, createStaticButtons } from '@/music/embed/pieces/buttons';

export async function reset (venti: Venti) {
  const message = venti.embedMessage;

  if (!message) {
    return;
  }

  const defaultEmbed = await createDefaultSongEmbed(venti.guild);

  await message.edit({
    embeds: [defaultEmbed],
  });
}

export async function refresh (venti: Venti) {
  const message = venti.embedMessage;

  if (!message) {
    logger.error('No embed message found');
    return;
  }

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

  await message.edit({
    embeds: [newEmbed],
    components: [staticButtons, primary, secondary, menu],
  });
}

export const manualUpdate: XiaoEvents[Events.ManualUpdate] = (
  venti,
) => {
  void refresh(venti);
};
