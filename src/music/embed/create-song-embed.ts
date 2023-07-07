import {
  ActionRowBuilder,
  APIEmbed,
  ButtonBuilder, ButtonComponentData,
  ButtonStyle,
  Colors,
  formatEmoji,
  Guild,
  StringSelectMenuBuilder,
  userMention,
} from 'discord.js';

import { fetchT } from 'twokei-i18next';
import {
  Menus,
} from '@/constants/music';
import { EmbedButtons, PlayerButtons } from '@/constants/buttons/player-buttons';
import { Twokei } from '@/app/Twokei';

const arts = [
  {
    name: 'Summertime Vibes',
    url: 'https://cdn.discordapp.com/attachments/1121890290442178651/1121891134537465939/FzAx_piaYAI9TR4.gif',
    author: 'Kldpxl',
    authorUrl: 'https://twitter.com/Kldpxl',
  },
];

export const createDefaultSongEmbed = async (guild: Guild): Promise<APIEmbed> => {
  const mention = Twokei.user?.id ? userMention(Twokei.user.id) : '@Twokei';

  const lightEmoji = formatEmoji('1069597636950249523');
  const randomArt = arts[Math.floor(Math.random() * arts.length)];

  const t = await fetchT(guild);

  const translations = {
    emoji: lightEmoji,
    mention,
    art: {
      name: randomArt.name,
      author: randomArt.author,
      authorUrl: randomArt.authorUrl,
    },
  };

  const description = t('player:embed.description', {
    joinArrays: '\n',
    returnObjects: true,
    ...translations,
  }) as string;

  return {
    description: description
      .split('\n')
      .map((line) => line.trim())
      .join('\n'),
    color: Colors.Blurple,
    image: {
      url: randomArt.url,
      height: 300,
      width: 300,
      proxy_url:
        'https://media.tenor.com/XAS0z1xPCIcAAAAd/cyberpunk-vaporwave.gif',
    },
    footer: {
      icon_url:
        'https://cdn.discordapp.com/attachments/926644381371469834/1077626687094792245/wvHtpZ4X_400x400.jpg',
      text: 'Contact me@doiska.dev | @doiska (on Discord)',
    },
  };
};

export const selectSongMenu = new ActionRowBuilder<StringSelectMenuBuilder>({
  components: [
    new StringSelectMenuBuilder()
      .setCustomId(Menus.SelectSongMenu)
      .setPlaceholder('Select a song')
      .setMinValues(0)
      .setMaxValues(1)
      .setDisabled(true)
      .setOptions([
        {
          default: true,
          label: 'Add more songs to use the select-menu!',
          value: 'add-more-songs',
          emoji: {
            name: 'light',
            id: '1069597636950249523',
          },
        },
      ]),
  ],
});

type UsableButton = {
  customId: string;
  style: ButtonStyle;
  emoji: string;
};

export async function useButtons(
  buttonRows: UsableButton[][],
  guild: Guild,
): Promise<ActionRowBuilder<ButtonBuilder>[]> {
  const t = await fetchT(guild);

  return buttonRows.map((buttons) => {
    const newButtons = buttons.map((button) => {
      const label = t(`embed.buttons.${button.customId.toLowerCase()}`, {
        ns: 'player',
      });

      return {
        ...button,
        label,
        type: 2,
      };
    });

    return new ActionRowBuilder<ButtonBuilder>({
      components: newButtons,
    });
  });
}

export const staticPrimaryButtons = [
  {
    style: ButtonStyle.Secondary,
    customId: EmbedButtons.DONATE,
    emoji: '<:pray:1077449609447751791>',
  },
  {
    style: ButtonStyle.Secondary,
    customId: EmbedButtons.SYNC_PLAYLIST,
    emoji: ':spotify_dark:1077441343456018463',
  },
];

const primaryPlayerEmbedButtons = [
  {
    style: ButtonStyle.Primary,
    emoji: '⏹️',
    customId: PlayerButtons.STOP,
  },
  {
    style: ButtonStyle.Primary,
    emoji: '⏮️',
    customId: PlayerButtons.PREVIOUS,
  },
  {
    style: ButtonStyle.Primary,
    emoji: '⏸️',
    customId: PlayerButtons.PAUSE,
  },

  {
    style: ButtonStyle.Primary,
    emoji: '⏭️',
    customId: PlayerButtons.SKIP,
  },
] as Exclude<ButtonComponentData, 'label'>[];

const secondaryEmbedButtons = [
  {
    style: ButtonStyle.Primary,
    emoji: '▶️',
    customId: PlayerButtons.SHUFFLE,
  },
  {
    style: ButtonStyle.Primary,
    emoji: '🔁',
    customId: PlayerButtons.LOOP,
  },
] as Exclude<ButtonComponentData, 'label'>[];
