import { PermissionFlagsBits } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';

import { setupGuildLanguage } from '@/modules/config/setup-guild-language';
import { setupNewChannel } from '@/modules/config/setup-new-channel';
import { setupSongMessage } from '@/modules/config/setup-song-message';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { sendPresetMessage } from '@/utils/utils';

import { resolveKey } from 'twokei-i18next';

@ApplyOptions<Command.Options>({
  name: 'setup',
  description: 'Setup the bot music channel',
  enabled: true,
  preconditions: ['GuildTextOnly'],
  cooldownDelay: 1_000,
})
export class PlayCommand extends Command {
  registerApplicationCommands (registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => builder
      .setName(this.name)
      .setDescription(this.description));
  }

  public override async chatInputRun (
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const { member, guild } = interaction;

    if (!guild || !isGuildMember(member)) {
      return;
    }

    const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);

    if (!isAdmin) {
      await sendPresetMessage({
        interaction,
        preset: 'error',
        message: ErrorCodes.MISSING_ADMIN_PERMISSIONS,
      });
      return;
    }

    await sendPresetMessage({
      preset: 'loading',
      interaction,
    });

    try {
      const response = await setupNewChannel(guild);
      const channelId = `<#${response.id}>`;

      await sendPresetMessage({
        interaction,
        preset: 'success',
        message: await resolveKey<string>(
          interaction,
          'commands:setup.channel_created',
          {
            channel: channelId,
          },
        ) ?? 'Success',
      });

      await setupGuildLanguage(response);
      await setupSongMessage(guild, response);
    } catch (error) {
      await sendPresetMessage({
        interaction,
        preset: 'error',
        message: await getReadableException(error),
      });
    }
  }
}
