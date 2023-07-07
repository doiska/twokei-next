import { EmbedBuilder } from 'discord.js';

import { fetchT } from 'twokei-i18next';
import { createDefaultSongEmbed } from '@/music/embed/create-song-embed';
import type { Venti } from '@/music/controllers/Venti';
import { logger } from '@/modules/logger-transport';

import { Events } from '../interfaces/player.types';
import type { XiaoEvents } from '../controllers/Xiao';

export async function reset(venti: Venti) {
  const message = venti.embedMessage;

  if (!message) {
    return;
  }

  const defaultEmbed = await createDefaultSongEmbed(venti.guild);

  await message.edit({
    embeds: [defaultEmbed],
  });
}

export async function refresh(venti: Venti, update: { embed: boolean, menu: boolean, buttons: boolean }) {
  const message = venti.embedMessage;

  if (!message) {
    logger.error('No message found');
    return;
  }

  const t = await fetchT(venti.guild);

  const defaultEmbed = await createDefaultSongEmbed(venti.guild);
  const newEmbed = EmbedBuilder.from(defaultEmbed);

  if (update.embed) {
    if (venti.queue.current) {
      const appendDescription = t('player:embed.description_playing', {
        track: {
          title: `[${venti.queue?.current?.title}](${venti.queue?.current?.uri})`,
          url: venti.queue?.current?.uri ?? null,
          author: venti.queue?.current?.author ?? null,
          requestedBy: venti.queue?.current?.requester?.tag ?? null,
        },
        defaultValue: '',
        joinArrays: '\n',
      });
      newEmbed.setDescription(defaultEmbed.description!.concat(appendDescription));
    }
  }

  message.edit({
    embeds: [newEmbed],
    components: message.components,
  });
}

export const manualUpdate: XiaoEvents[Events.ManualUpdate] = (
  venti,
  update,
) => {
  refresh(venti!, {
    embed: update?.embed ?? false,
    menu: update?.components ?? false,
    buttons: update?.components ?? false,
  });
};
