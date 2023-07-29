import { type ApplicationCommandRegistry, Command, container } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Awaitable } from '@sapphire/utilities';
import { createSongProfileEmbed } from '@/constants/music/song-profile';
import { fetchT } from 'twokei-i18next';
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

    const t = await fetchT(interaction.guild);

    const profile = await container.profiles.get(user);

    await interaction.reply(
      createSongProfileEmbed(interaction.user, user, t, profile),
    );
  }

  public async contextMenuRun (
    interaction: Command.ContextMenuCommandInteraction,
  ) {
    if (!interaction.isUserContextMenuCommand() || !isGuildMember(interaction.targetMember)) {
      return;
    }

    const target = interaction.targetUser;

    const t = await fetchT(interaction);

    const profile = await container.profiles.get(target);

    const reply = createSongProfileEmbed(interaction.user, target, t, profile);

    if (interaction.channel && isTextChannel(interaction.channel)) {
      await interaction.reply(reply);
    } else {
      await interaction.user.send(reply);
    }
  }
}
