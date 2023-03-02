import {
  ActionRowBuilder,
  APIButtonComponent,
  APIEmbed,
  APIMessageComponentEmoji, ButtonBuilder,
  ButtonStyle,
  Colors,
  formatEmoji,
  StringSelectMenuBuilder,
  userMention
} from 'discord.js';
import { Locale } from '../../translation/i18n';
import { Twokei } from '../../app/Twokei';
import {
  Button,
  DynamicDefaultButtons, DynamicPlaylistButtons,
  DynamicPrimaryButtons,
  DynamicSecondaryButtons,
  Menus
} from '../../constants/music';
import { t } from 'i18next';
import { Venti } from '../controllers/Venti';

export const createDefaultSongEmbed = (lang: Locale): APIEmbed => {

  const mention = userMention(Twokei.user!.id) || '@Twokei';

  const lightEmoji = formatEmoji('1069597636950249523');

  const description = t('player:embed.description', {
    mention: mention,
    emoji: lightEmoji,
    lng: lang,
    joinArrays: '\n',
    returnObjects: true
  }) as string;

  return {
    description: description,
    color: Colors.DarkButNotBlack,
    author: {
      name: 'Created by doiská#0001',
      url: 'https://twitter.com/two2kei',
      icon_url: 'https://cdn.discordapp.com/attachments/926644381371469834/1077626687094792245/wvHtpZ4X_400x400.jpg'
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

const parseButtonsToComponent = (buttons: Record<string, Button>): ActionRowBuilder<ButtonBuilder> => {
  const components = Object.entries(buttons).map(([key, button]) => {

    const customIdOrUrl = button.url ? { url: button.url } : { customId: key };

    return ButtonBuilder.from({
      ...customIdOrUrl,
      label: button.label ?? t(`embed.buttons.${key.toLowerCase()}`, { ns: 'player', lng: 'pt_br' }) as string,
      style: button.style || ButtonStyle.Primary,
      emoji: button.emoji as APIMessageComponentEmoji,
      disabled: button.disabled,
      type: 2
    } as APIButtonComponent);
  });

  return new ActionRowBuilder({ components })
}

const createDefaultPrimaryButtons = (locale: Locale) => parseButtonsToComponent(DynamicDefaultButtons(locale));
export const createPlaylistButtons = (locale: Locale) => parseButtonsToComponent(DynamicPlaylistButtons(locale));

export const createDefaultButtons = (locale: Locale) => {
  return [createDefaultPrimaryButtons(locale), createPlaylistButtons(locale)];
}

export const createPrimaryButtons = (player: Venti) => parseButtonsToComponent(DynamicPrimaryButtons(player));
export const createSecondaryButtons = (player: Venti) => parseButtonsToComponent(DynamicSecondaryButtons(player));