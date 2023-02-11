import {
  ActionRowBuilder, APIButtonComponent,
  APIEmbed, APIMessageComponentEmoji,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  formatEmoji,
  StringSelectMenuBuilder,
  userMention
} from 'discord.js';
import { Locale } from '../../translation/i18n';
import { Twokei } from '../../app/Twokei';
import { PlayerPrimaryButtons, SecondaryButtons, Menus, Button, DefaultButtons } from '../../constants/music';
import { t } from 'i18next';

export const createDefaultSongEmbed = (lang: Locale): APIEmbed => {

  const mention = userMention(Twokei.user!.id) || '@Twokei';

  const lightEmoji = formatEmoji('1069597636950249523');

  const description = t('player:embed.description', {
    mention: mention,
    emoji: lightEmoji,
    returnObjects: true,
    lng: lang,
  }) as string[];

  return {
    description: description.join('\n'),
    color: Colors.DarkButNotBlack,
    author: {
      name: 'Created by doiská#0001',
      url: 'https://twitter.com/two2kei',
      icon_url: 'https://cdn.discordapp.com/attachments/1060272332855316590/1069609975535636640/FCtRtYIVIAYGjU_.jpg'
    },
    image: {
      url: 'https://media.tenor.com/XAS0z1xPCIcAAAAd/cyberpunk-vaporwave.gif',
      height: 300,
      width: 300,
      proxy_url: 'https://media.tenor.com/XAS0z1xPCIcAAAAd/cyberpunk-vaporwave.gif'
    },
    footer: {
      text: `Twokei by doiská#0001 | v1.0.0 (early-alpha)`
    }
  }
}

export const createDefaultMenu = (lang: Locale) => {
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

function createButtonRow(buttons: Record<string, Button>, lang: Locale) {
  const components = Object.entries(buttons).map(([key, button]) => ({
    custom_id: key,
    label: t(`embed.buttons.${key.toLowerCase()}`, { ns: 'player', lng: lang }) as string,
    style: button.style || ButtonStyle.Primary,
    emoji: button.emoji as APIMessageComponentEmoji,
    type: 2
  }) satisfies APIButtonComponent);

  return new ActionRowBuilder<ButtonBuilder>({
    components
  });
}

export const createDefaultButtons = (lang: Locale) => createButtonRow(DefaultButtons, lang);
export const createPrimaryRow = (lang: Locale) => createButtonRow(PlayerPrimaryButtons, lang);
export const createSecondaryRow = (lang: Locale) => createButtonRow(SecondaryButtons, lang);