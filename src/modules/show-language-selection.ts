import { ActionRowBuilder, EmbedBuilder, GuildMember, StringSelectMenuBuilder, TextChannel } from 'discord.js';
import { isValidLocale, LocaleFlags, VALID_LOCALES } from '../translation/i18n';
import { setGuildLocale } from './update-guild-locale';
import { getGuidLocale } from '../translation/guild-i18n';

export async function showLanguageSelection(channel: TextChannel, member: GuildMember) {
  if (!member.permissions.has('Administrator')) {
    throw new Error('You need to be an administrator to use this command.');
  }

  // if (!member.guild.members.me?.permissions.has('Administrator')) {
  //   throw new Error('I need to be an administrator to use this command.');
  // }

  const currentLocale = await getGuidLocale(member.guild.id) || 'pt_br';

  const embed = new EmbedBuilder()
      .setTitle('Twokei')
      .setDescription('Select a language for the bot.')
      .setTimestamp();

  const selectMenu = new StringSelectMenuBuilder();

  selectMenu.setCustomId('language-selection');
  selectMenu.setPlaceholder('Select a language');

  selectMenu.addOptions(VALID_LOCALES.map(locale => ({
    label: `${LocaleFlags[locale]} ${locale.replace('_', ' ').toUpperCase()}`,
    value: locale,
    default: locale.toLowerCase() === currentLocale.toLowerCase()
  })));

  const row = new ActionRowBuilder<StringSelectMenuBuilder>({
    components: [selectMenu]
  });

  const languageSelectionMessage = await channel.send({
    embeds: [embed],
    components: [row]
  });


  languageSelectionMessage.awaitMessageComponent({
    filter: (interaction) =>
        interaction.user.id === member.id &&
        interaction.customId === 'language-selection' &&
        interaction.isStringSelectMenu(),
    time: 15000
  }).then((interaction) => {
    if (!interaction.isStringSelectMenu()) {
      return;
    }

    const selected = interaction.values[0];

    if (!isValidLocale(selected)) {
      return interaction.reply({
        content: `The language ${selected} is not valid.`,
        ephemeral: true
      })
    }

    setGuildLocale(interaction.guild!, selected);

    return interaction.reply({
      content: `You selected ${selected}`,
      ephemeral: true
    });
  }).catch(() => {
    return languageSelectionMessage.edit({
      embeds: [embed.setDescription('You took too long to select a language.')],
      components: []
    });
  }).finally(() => setTimeout(() => languageSelectionMessage.delete(), 5000));
}