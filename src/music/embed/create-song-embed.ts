import {
  ActionRowBuilder,
  APIEmbed,
  Colors,
  EmbedBuilder, formatEmoji,
  Guild, resolvePartialEmoji, StringSelectMenuBuilder,
  TextChannel,
  userMention
} from 'discord.js';
import { Locale } from '../../translation/i18n';
import { Twokei } from '../../app/Twokei';
import { Menus } from '../../constants/music';

export const createDefaultSongEmbed = (lang: Locale): APIEmbed => {

  const mention = userMention(Twokei.user!.id) || '@Twokei';

  const lightEmoji = formatEmoji('1069597636950249523');

  const description = [
    '',
    lightEmoji + '** How to use? It\'s easy!**',
    '',
    `- Easiest way: **${mention} <song>**.`,
    `- Or click here </play:1067082391975362654>.`,
    '- If you have **any questions**, click here </setup:1067082391975362656>.',
    '',
  ];

  return {
    title: lightEmoji + ' Twokei',
    description: description.join('\n'),
    color: Colors.DarkButNotBlack,
    author: {
      name: 'Created by doiská#0001',
      url: 'https://twitter.com/two2kei',
      icon_url: 'https://cdn.discordapp.com/attachments/1060272332855316590/1069609975535636640/FCtRtYIVIAYGjU_.jpg'
    },
    image: {
      url: 'https://media.tenor.com/XAS0z1xPCIcAAAAd/cyberpunk-vaporwave.gif',
      height: 200,
      width: 200,
      proxy_url: 'https://media.tenor.com/XAS0z1xPCIcAAAAd/cyberpunk-vaporwave.gif',
    },
    footer: {
      text: `Twokei by doiská#0001 | v1.0.0 (early-alpha)`,
    }
  }
}

export const createDefaultSongComponents = (lang: Locale) => {
  const menu = new StringSelectMenuBuilder();

  menu.setCustomId(Menus.SelectSongMenu);
  menu.setPlaceholder('Select a song');
  menu.setMinValues(0);
  menu.setMaxValues(1);
  menu.setOptions([
    {
      default: true,
      label: 'Add more songs to use the select-menu!',
      value: 'add-more-songs',
      emoji: {
        name: 'light',
        id: '1069597636950249523'
      }
    }
  ]);

  menu.setDisabled(true);

  return new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(menu);
}