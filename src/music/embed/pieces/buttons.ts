import {
  ActionRowBuilder,
  type ButtonBuilder,
  ButtonStyle,
  ComponentType,
  type Guild,
  type InteractionButtonComponentData,
} from 'discord.js';

import { EmbedButtons, PlayerButtons } from '@/constants/music/player-buttons';
import type { Venti } from '@/music/controllers/Venti';

import { fetchT, type TFunction } from 'twokei-i18next';

function parseButtonLabel<T> (t: TFunction, button: T & { label?: string, customId: string }): T & { label: string, customId: string } {
  return {
    ...button,
    label: button.label ?? t(`player:embed.buttons.${button.customId.toLowerCase()}`),
    type: ComponentType.Button,
  };
}

export async function createStaticButtons (guild: Guild) {
  const t = await fetchT(guild);

  return new ActionRowBuilder<ButtonBuilder>({
    components: [
      {
        style: ButtonStyle.Primary,
        customId: EmbedButtons.HOW_TO_USE,
      },
      {
        style: ButtonStyle.Secondary,
        customId: EmbedButtons.DONATE,
        emoji: '<:pray:1077449609447751791>',
      },
      {
        style: ButtonStyle.Secondary,
        customId: EmbedButtons.VIEW_PROFILE,
        emoji: ':spotify_dark:1077441343456018463',
      },
    ].map(button => parseButtonLabel(t, button)) as InteractionButtonComponentData[],
  });
}

export async function createDynamicButtons (venti: Venti) {
  const t = await fetchT(venti.guild);

  const primary = [
    {
      style: ButtonStyle.Secondary,
      emoji: '⏹️',
      customId: PlayerButtons.STOP,
    },
    {
      style: ButtonStyle.Secondary,
      emoji: '⏮️',
      customId: PlayerButtons.PREVIOUS,
      disabled: !venti.queue.previous,
    },
    {
      style: venti.playing ? ButtonStyle.Secondary : ButtonStyle.Primary,
      emoji: '⏸️',
      customId: PlayerButtons.PAUSE,
      label: venti.playing ? t('player:embed.buttons.pause') : t('player:embed.buttons.resume'),
    },
    {
      style: ButtonStyle.Secondary,
      emoji: '⏭️',
      customId: PlayerButtons.SKIP,
      disabled: !venti.queue.length,
    },
  ].map(button => parseButtonLabel(t, button));

  const secondary = [
    {
      style: ButtonStyle.Secondary,
      emoji: '️<:shuffle:976599781742886912>',
      customId: PlayerButtons.SHUFFLE,
      disabled: venti.queue.length <= 2,
    },
    {
      style: venti.loop === 'none' ? ButtonStyle.Secondary : ButtonStyle.Primary,
      emoji: '🔁',
      label: t(`player:embed.buttons.loop.${venti.loop.toLowerCase()}`),
      customId: PlayerButtons.LOOP,
    },
    {
      style: ButtonStyle.Secondary,
      emoji: '⭐',
      customId: EmbedButtons.SAVE_PLAYLIST,
      disabled: true,
    },
  ].map(button => parseButtonLabel(t, button));

  return {
    primary: new ActionRowBuilder<ButtonBuilder>({ components: primary as InteractionButtonComponentData[] }),
    secondary: new ActionRowBuilder<ButtonBuilder>({ components: secondary as InteractionButtonComponentData[] }),
  };
}