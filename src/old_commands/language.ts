import { eq } from 'drizzle-orm';

import { PermissionsBitField } from 'discord.js';
import { isTextChannel } from '@sapphire/discord.js-utilities';

import { setupGuildLanguage } from '../modules/config/setup-guild-language';
import { guilds } from '../db/schemas/Guild';
import { kil } from '../db/Kil';
import { CommandContext, createCommand } from '../../../twokei-framework';

const execute = async (context: CommandContext) => {
  if (
    !context.member
    || !context.guild
    || !context.channel
    || !isTextChannel(context.channel)
  ) {
    return;
  }

  const newLocale = await setupGuildLanguage(context.channel);
  await kil
    .update(guilds)
    .set({ locale: newLocale })
    .where(eq(guilds.guildId, context.guild.id));
};

export const localeCommand = createCommand(
  {
    name: 'language',
    description: 'Loop the current song or the queue',
    slash: (slash) => slash.setDefaultMemberPermissions(
      PermissionsBitField.Flags.Administrator,
    ),
  },
  execute,
);
