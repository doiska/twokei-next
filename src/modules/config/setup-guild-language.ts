import { eq } from 'drizzle-orm';
import { getFixedT } from 'i18next';

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  GuildTextBasedChannel,
  PermissionsBitField,
} from 'discord.js';

import { Twokei } from '@/app/Twokei';
import { kil } from '@/db/Kil';
import { guilds } from '@/db/schemas/Guild';
import { Locale, LocaleFlags, VALID_LOCALES } from '@/locales/i18n';

export async function setupGuildLanguage(channel: GuildTextBasedChannel) {
  const { guild } = channel;

  const language: Locale = guild.preferredLocale === 'pt-BR' ? 'pt_br' : 'en_us';
  const ft = getFixedT(language, 'tutorial');

  const embed = new EmbedBuilder()
    .setTitle(ft('language.title'))
    .setDescription(ft('language.description', { joinArrays: '\n' }))
    .setThumbnail(Twokei.user?.displayAvatarURL({ size: 2048 }) ?? '');

  const languageButtons = VALID_LOCALES.map((locale) => new ButtonBuilder()
    .setEmoji(LocaleFlags[locale])
    .setCustomId(`language-${locale}`)
    .setStyle(ButtonStyle.Secondary));

  const helpButton = new ButtonBuilder()
    .setLabel(ft('language.help'))
    .setURL('https://google.com')
    .setStyle(ButtonStyle.Link)
    .setDisabled(true);

  const row = new ActionRowBuilder<ButtonBuilder>({
    components: [...languageButtons, helpButton],
  });

  const message = await channel.send({ embeds: [embed], components: [row] });

  const interaction = await message.awaitMessageComponent({
    componentType: ComponentType.Button,
    filter: (interaction) => (interaction.member?.permissions as PermissionsBitField).has(
      'ManageChannels',
    ),
    time: 1000 * 60 * 5,
  });

  interaction.deferUpdate();

  await message.delete();

  const newLocale = interaction?.customId.split('-')?.[1] ?? language;

  await kil
    .update(guilds)
    .set({ locale: newLocale })
    .where(eq(guilds.guildId, guild.id));

  return newLocale as Locale;
}
