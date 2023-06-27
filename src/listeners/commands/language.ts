import {isTextChannel} from '@sapphire/discord.js-utilities';
import {PermissionsBitField} from 'discord.js';
import {CommandContext, createCommand} from 'twokei-framework';

import {eq} from 'drizzle-orm';

import {kil} from '../../db/Kil';
import {guilds} from '../../db/schemas/Guild';
import {setupGuildLanguage} from '../../modules/config/setup-guild-language';

const execute = async (context: CommandContext) => {
  if (!context.member || !context.guild || !context.channel || !isTextChannel(context.channel)) {
    return;
  }

  const newLocale = await setupGuildLanguage(context.channel);
  await kil.update(guilds).set({locale: newLocale}).where(eq(guilds.guildId, context.guild.id));
};

export const localeCommand = createCommand({
  name: 'language',
  description: 'Loop the current song or the queue',
  slash: slash => slash.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
}, execute);
