import { CommandContext, createCommand } from 'twokei-framework';
import { isTextChannel } from '@sapphire/discord.js-utilities';
import { ActionRowBuilder, EmbedBuilder, PermissionsBitField, StringSelectMenuBuilder } from 'discord.js';
import { LocaleFlags, VALID_LOCALES } from '../../translation/i18n';
import { getGuidLocale } from '../../translation/guild-i18n';

const execute = async (context: CommandContext) => {
  if (!context.member || !context.guild || !context.channel || !isTextChannel(context.channel)) {
    return;
  }

  const currentLocale = await getGuidLocale(context.guild.id) || 'pt_br';
  console.log(currentLocale)

  // await context.interaction.editReply('Not implemented yet');

  // const currentLocale = await getGuidLocale(context.guild.id) || 'pt_br';
  //
  // const embed = new EmbedBuilder()
  //   .setTitle('Twokei')
  //   .setDescription('Select a language for the bot.')
  //   .setTimestamp();
  //
  // const selectMenu = new StringSelectMenuBuilder();
  //
  // selectMenu.setCustomId('language-selection');
  // selectMenu.setPlaceholder('Select a language');
  //
  // selectMenu.addOptions(VALID_LOCALES.map(locale => ({
  //   label: `${LocaleFlags[locale]} ${locale.replace('_', ' ').toUpperCase()}`,
  //   value: locale,
  //   default: locale.toLowerCase() === currentLocale.toLowerCase()
  // })));
  //
  // const row = new ActionRowBuilder<StringSelectMenuBuilder>({
  //   components: [selectMenu]
  // });
  //
  // const replied = await context.interaction.reply({
  //   embeds: [embed],
  //   components: [row]
  // });
  //
  // const languageSelectionResponse = await replied.awaitMessageComponent({
  //   filter: (interaction) =>
  //     interaction.user.id === context.member!.id &&
  //     interaction.customId === 'language-selection' &&
  //     interaction.isStringSelectMenu()
  // });
  //
  // console.log(languageSelectionResponse)
  //
  // // return showLanguageSelection(context.channel, context.member!).catch(e => e.message);

}

export const localeCommand = createCommand({
  name: 'language',
  description: 'Loop the current song or the queue',
  slash: slash => slash.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
}, execute);
