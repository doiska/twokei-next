import { Command, container } from '@sapphire/framework';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';

import { fetchT } from 'twokei-i18next';
import { Embed } from '@/utils/messages';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { PermissionFlagsBits } from 'discord.js';
import { setupNewChannel } from '@/modules/config/setup-new-channel';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { setupGuildLanguage } from '@/modules/config/setup-guild-language';
import { setupSongMessage } from '@/modules/config/setup-song-message';
import { getRandomLoadingMessage } from '@/utils/utils';

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

    const t = await fetchT(interaction);

    const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);

    if (!isAdmin) {
      await container.client.replyTo(
        interaction,
        Embed.error(t(ErrorCodes.MISSING_ADMIN_PERMISSIONS, { ns: 'error' }) ?? 'Missing permissions'),
        15,
      );
      return;
    }

    await container.client.replyTo(interaction, t(getRandomLoadingMessage()) ?? 'Loading...');

    try {
      const response = await setupNewChannel(guild);
      const channelId = `<#${response.id}>`;

      await container.client.replyTo(
        interaction,
        Embed.success(t('commands:setup.channel_created', { channel: channelId }) ?? 'Success'),
        15,
      );

      await setupGuildLanguage(response);
      await setupSongMessage(guild, response);
    } catch (error) {
      await container.client.replyTo(interaction, Embed.error(await getReadableException(error)), 15);
    }
  }
}
