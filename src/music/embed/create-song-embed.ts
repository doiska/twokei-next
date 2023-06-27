import {t} from 'i18next';

import {
  ActionRowBuilder,
  APIButtonComponent,
  APIEmbed,
  APIMessageComponentEmoji,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  formatEmoji,
  StringSelectMenuBuilder,
  userMention
} from 'discord.js';


import {Twokei} from '../../app/Twokei';
import {
  Button,
  DynamicDefaultButtons,
  DynamicPrimaryButtons,
  DynamicSecondaryButtons,
  Menus
} from '../../constants/music';
import {Locale} from '../../i18n/i18n';
import {Venti} from '../controllers/Venti';

const arts = [
  {
    name: 'Summertime Vibes',
    url: 'https://cdn.discordapp.com/attachments/1121890290442178651/1121891134537465939/FzAx_piaYAI9TR4.gif',
    author: 'Kldpxl',
    authorUrl: 'https://twitter.com/Kldpxl'
  }
];

export const createDefaultSongEmbed = (lang: Locale): APIEmbed => {

  const mention = Twokei.user?.id ? userMention(Twokei.user.id) : '@Twokei';

  const lightEmoji = formatEmoji('1069597636950249523');
  const randomArt = arts[Math.floor(Math.random() * arts.length)];

  const translations = {
    'emoji': lightEmoji,
    'mention': mention,
    'art.name': randomArt.name,
    'art.author': randomArt.author,
    'art.authorUrl': randomArt.authorUrl,
  };

  const description = t('player:embed.description', {
    lng: lang,
    joinArrays: '\n',
    returnObjects: true,
    replace: translations
  }) as string;

  return {
    description: description
      .split('\n')
      .map(line => line.trim())
      .join('\n'),
    color: Colors.Blurple,
    image: {
      url: randomArt.url,
      height: 300,
      width: 300,
      proxy_url: 'https://media.tenor.com/XAS0z1xPCIcAAAAd/cyberpunk-vaporwave.gif'
    },
    footer: {
      icon_url: 'https://cdn.discordapp.com/attachments/926644381371469834/1077626687094792245/wvHtpZ4X_400x400.jpg',
      text: 'Contact me@doiska.dev | @doiska (on Discord)'
    }
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
            id: '1069597636950249523'
          }
        }
      ])
  ]
});

const parseButtonsToComponent = (buttons: Record<string, Button>, locale: Locale): ActionRowBuilder<ButtonBuilder> => {
  const components = Object.entries(buttons).map(([key, button]) => {
    const customIdOrUrl = button.url ? {url: button.url} : {customId: key};
    const label = t(`embed.buttons.${key.toLowerCase()}`, {ns: 'player', lng: locale}) ?? button.label;

    return ButtonBuilder.from({
      ...customIdOrUrl,
      label: label,
      style: button.style || ButtonStyle.Primary,
      emoji: button.emoji as APIMessageComponentEmoji,
      disabled: button.disabled,
      type: 2
    } as APIButtonComponent);
  });

  return new ActionRowBuilder({components});
};

const defaultPrimaryButtons = (locale: Locale) => parseButtonsToComponent(DynamicDefaultButtons, locale);

export const createDefaultButtons = (locale: Locale) => [defaultPrimaryButtons(locale)];

export const createPrimaryButtons = (player: Venti) => parseButtonsToComponent(DynamicPrimaryButtons(player), player.locale);
export const createSecondaryButtons = (player: Venti) => parseButtonsToComponent(DynamicSecondaryButtons(player), player.locale);