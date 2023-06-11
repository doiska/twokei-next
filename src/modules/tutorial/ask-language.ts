import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  Guild,
  Locale, Message, PermissionsBitField,
} from 'discord.js';
import { getFixedT } from 'i18next';
import { LocaleFlags, VALID_LOCALES } from '../../i18n/i18n';
import { Twokei } from '../../app/Twokei';

export async function askLanguage(message: Message, guild: Guild) {
  const embed = new EmbedBuilder();
  const language = guild.preferredLocale === Locale.PortugueseBR ? 'pt_br' : 'en_us';

  const ft = getFixedT(language, 'tutorial');

  embed.setTitle(ft('language.title'));
  embed.setDescription(ft('language.description', { joinArrays: '\n' }));
  embed.setThumbnail(Twokei.user!.displayAvatarURL({ size: 2048 }) ?? '');

  const languageButtons = VALID_LOCALES.map(locale =>
    new ButtonBuilder()
      .setEmoji(LocaleFlags[locale])
      .setCustomId(`language-${locale}`)
      .setStyle(ButtonStyle.Secondary)
  );

  const helpButton = new ButtonBuilder()
    .setLabel(ft('language.help'))
    .setURL('https://google.com')
    .setStyle(ButtonStyle.Link)
    .setDisabled(true);

  const row = new ActionRowBuilder<ButtonBuilder>({
    components: [...languageButtons, helpButton]
  });

  await message.edit({ embeds: [embed], components: [row] });

  const interaction = await message.awaitMessageComponent({
    componentType: ComponentType.Button,
    filter: interaction => (interaction.member?.permissions as PermissionsBitField).has('ManageChannels'),
    time: 1000 * 60 * 5
  });

  interaction.deferUpdate();

  if(interaction) {
    return interaction?.customId.split('-')?.[1] as Locale;
  }

  return language as Locale;
}