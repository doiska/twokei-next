import { type ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Awaitable } from '@sapphire/utilities';
import { createSongProfileEmbed } from '@/features/song-profile/show-song-profile';
import { ApplicationCommandType } from 'discord.js';
import { isGuildMember, isTextChannel } from '@sapphire/discord.js-utilities';

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
            .setDescription('The user to view the profile of')));

    registry.registerContextMenuCommand((builder) =>
      builder.setName('View music profile')
        .setType(ApplicationCommandType.User));
  }

  public async chatInputRun (interaction: Command.ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user', true) ?? interaction.user;

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

    const reply = await createSongProfileEmbed(interaction.user, target);

    if (interaction.channel && isTextChannel(interaction.channel)) {
      await interaction.reply(reply);
    } else {
      await interaction.user.send(reply);
    }
  }
}
