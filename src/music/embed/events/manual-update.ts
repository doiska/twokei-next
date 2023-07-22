import { EmbedBuilder } from 'discord.js';

import { fetchT } from 'twokei-i18next';
import {
  createDefaultSongEmbed,
  createSelectMenu,
  primaryPlayerEmbedButtons,
  secondaryPlayerEmbedButtons, staticPrimaryButtons,
  useButtons,
} from '@/music/embed/create-song-embed';
import type { Venti } from '@/music/controllers/Venti';
import { LoopStates } from '@/music/controllers/Venti';
import { logger } from '@/modules/logger-transport';

import { type Events } from '../../interfaces/player.types';
import type { XiaoEvents } from '../../controllers/Xiao';

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

export async function refresh (venti: Venti, update: { embed: boolean, menu: boolean, buttons: boolean }) {
  const message = venti.embedMessage;

  if (!message) {
    logger.error('No message found');
    return;
  }

  const [t, defaultEmbed] = await Promise.all([
    fetchT(venti.guild),
    createDefaultSongEmbed(venti.guild),
  ]);

  const newEmbed = EmbedBuilder.from(defaultEmbed);

  if (update.embed && venti.queue.current) {
    const appendDescription = t('player:embed.description_playing', {
      loop: venti.loop !== LoopStates.NONE ? t(`player:embed.loop.${venti.loop}`) : '',
      track: {
        title: `[${venti.queue?.current?.title}](${venti.queue?.current?.uri})`,
        url: venti.queue?.current?.uri ?? null,
        author: venti.queue?.current?.author ?? null,
        requestedBy: venti.queue?.current?.requester?.tag ?? null,
      },
      defaultValue: '',
      joinArrays: '\n',
    });
    newEmbed.setDescription(defaultEmbed.description?.concat(appendDescription) ?? '');
  }

  const buttons = await useButtons([
    staticPrimaryButtons,
    primaryPlayerEmbedButtons,
    secondaryPlayerEmbedButtons,
  ],
  venti.guild);

  const menu = createSelectMenu(venti.queue);

  await message.edit({
    embeds: [newEmbed],
    components: [...buttons, menu],
  });
}

export const manualUpdate: XiaoEvents[Events.ManualUpdate] = (
  venti,
  update,
) => {
  void refresh(venti, {
    embed: update?.embed ?? false,
    menu: update?.components ?? false,
    buttons: update?.components ?? false,
  });
};
