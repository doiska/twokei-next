import {
  ActionRowBuilder,
  EmbedBuilder,
  GuildMember,
  StringSelectMenuBuilder,
  TextChannel
} from 'discord.js';
import { LocaleFlags, VALID_LOCALES } from '../translation/i18n';

export async function showLanguageSelection(channel: TextChannel, member: GuildMember) {
  if (!member.permissions.has('Administrator')) {
    throw new Error('You need to be an administrator to use this command.');
  }

  // if (!member.guild.members.me?.permissions.has('Administrator')) {
  //   throw new Error('I need to be an administrator to use this command.');
  // }

  const embed = new EmbedBuilder()
    .setDescription('Select a language for the bot.');

  const selectMenu = new StringSelectMenuBuilder();
  selectMenu.setCustomId('language-selection');
  selectMenu.setPlaceholder('Select a language');
  selectMenu.addOptions(VALID_LOCALES.map(locale => ({
    label: `${LocaleFlags[locale]} ${locale}`,
    value: locale
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

    return interaction.reply({
      content: `You selected ${interaction.values[0]}`,
      ephemeral: true
    });
  }).catch(() => {
    return languageSelectionMessage.edit({
      embeds: [embed.setDescription('You took too long to select a language.')],
      components: []
    });
  }).finally(() => setTimeout(() => languageSelectionMessage.delete(), 5000));
}