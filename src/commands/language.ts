import { CommandContext, createCommand } from 'twokei-framework';
import { showLanguageSelection } from '../modules/show-language-selection';
import { isTextChannel } from '@sapphire/discord.js-utilities';
import { PermissionsBitField } from 'discord.js';

const execute = async (context: CommandContext) => {

  if (!context.member || !context.channel || !isTextChannel(context.channel)) {
    return;
  }

  return showLanguageSelection(context.channel, context.member!).catch(e => e.message);
}

export const localeCommand = createCommand({
  name: 'language',
  description: 'Loop the current song or the queue',
  slash: slash => slash.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
}, execute);
