import {
  ActionRowBuilder,
  type APIEmbed,
  Colors,
  formatEmoji,
  type Guild,
  StringSelectMenuBuilder,
  userMention,
} from 'discord.js';

import { fetchT } from 'twokei-i18next';
import { type TrackQueue } from '@/music/structures/TrackQueue';
import { parseTracksToMenuItem } from '@/music/embed/guild-embed-manager-helper';
import { Menus } from '@/constants/music/player-buttons';
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
  };

  const description = t('player:embed.description', {
    joinArrays: '\n',
    returnObjects: false,
    ...translations,
  });

  return {
    description,
    color: Colors.Blurple,
    image: {
      url: randomArt.url,
      height: 300,
      width: 300,
      proxy_url:
        'https://media.tenor.com/XAS0z1xPCIcAAAAd/cyberpunk-vaporwave.gif',
    },
    author: {
      name: 'Feito por: doiska.dev',
      url: 'https://doiska.dev/contact',
    },
    footer: {
      text: `Art: ${randomArt.author} - ${randomArt.authorUrl}`,
    },
  };
};

export const createSelectMenu = (tracks?: TrackQueue) => {
  const noTrack = tracks?.length === 0 && !tracks.current && !tracks.previous;

  const options = tracks
    ? parseTracksToMenuItem(tracks)
    : [
        {
          default: true,
          label: 'Add more songs to use the select-menu!',
          value: 'add-more-songs',
          emoji: {
            name: 'light',
            id: '1069597636950249523',
          },
        },
      ];

  return new ActionRowBuilder<StringSelectMenuBuilder>({
    components: [
      new StringSelectMenuBuilder()
        .setCustomId(Menus.SelectSongMenu)
        .setPlaceholder('Select a song')
        .setMinValues(0)
        .setMaxValues(1)
        .setDisabled(noTrack)
        .setOptions(options),
    ],
  });
};
