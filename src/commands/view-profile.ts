import { ApplicationCommandType, ComponentType, type User } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { type ApplicationCommandRegistry, Command, container } from '@sapphire/framework';
import type { Awaitable } from '@sapphire/utilities';
import { noop } from '@sapphire/utilities';

import { createSongProfileEmbed } from '@/features/song-profile/show-song-profile';

@ApplyOptions<Command.Options>({
  name: 'profile',
  aliases: ['viewprofile'],
  description: 'View yours or another users profile',
})
export class ViewProfile extends Command {
  public registerApplicationCommands (
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('The user to view the profile of')
            .setRequired(false)));

    registry.registerContextMenuCommand((builder) =>
      builder.setName('View music profile')
        .setType(ApplicationCommandType.User));
  }

  public async chatInputRun (interaction: Command.ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user', false) ?? interaction.user;

    if (!interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used in a server.',
        ephemeral: true,
      });
      return;
    }

    await interaction.reply(
      await createSongProfileEmbed(interaction.user, user),
    );
  }

  public async contextMenuRun (
    interaction: Command.ContextMenuCommandInteraction,
  ) {
    if (!interaction.isUserContextMenuCommand() || !isGuildMember(interaction.targetMember)) {
      return;
    }

    const target = interaction.targetUser;

    await this.sendEmbed(
      interaction,
      target,
    );
  }

  private async sendEmbed (
    interaction: Command.ContextMenuCommandInteraction | Command.ChatInputCommandInteraction,
    target: User,
  ) {
    if (!interaction.isRepliable()) {
      return;
    }

    const duration = 30;

    const replyContent = await createSongProfileEmbed(interaction.user, target);

    const response = await container.reply(interaction, {
      ...replyContent,
      ephemeral: interaction.user.id !== target.id,
    }, duration);

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.user.id === interaction.user.id,
      time: duration * 1000,
    });

    collector.on('collect', async buttonInteraction => {
      await buttonInteraction.deferUpdate();
      await container.profiles.actions.toggleLike(interaction.user.id, target.id);
      await interaction.editReply(await createSongProfileEmbed(interaction.user, target));
    });

    collector.on('end', async () => {
      await interaction.deleteReply()
        .catch(noop);
    });
  }
}
