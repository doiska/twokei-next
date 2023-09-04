import {
  ApplicationCommandType,
  ComponentType,
  GuildMember,
  type User,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import {
  type ApplicationCommandRegistry,
  Command,
  container,
} from "@sapphire/framework";
import type { Awaitable } from "@sapphire/utilities";
import { noop } from "@sapphire/utilities";

import { createSongProfileEmbed } from "@/features/song-profile/show-song-profile";
import { sendPresetMessage } from "@/lib/message-handler/helper";

@ApplyOptions<Command.Options>({
  name: "profile",
  description: "View yours or another users profile",
})
export class ViewProfile extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to view the profile of")
            .setRequired(false),
        ),
    );

    registry.registerContextMenuCommand((builder) =>
      builder
        .setName("View music profile")
        .setType(ApplicationCommandType.User),
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user", false) ?? interaction.user;

    if (!interaction.guild || !isGuildMember(interaction.member)) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply(
      await createSongProfileEmbed(interaction.member, user),
    );
  }

  public async contextMenuRun(
    interaction: Command.ContextMenuCommandInteraction,
  ) {
    if (
      !interaction.isUserContextMenuCommand() ||
      !isGuildMember(interaction.targetMember)
    ) {
      return;
    }

    const target = interaction.targetUser;

    await this.sendEmbed(interaction, target);
  }

  private async sendEmbed(
    interaction:
      | Command.ContextMenuCommandInteraction
      | Command.ChatInputCommandInteraction,
    target: User,
  ) {
    if (!interaction.isRepliable() || !isGuildMember(interaction.member)) {
      return;
    }

    const duration = 30;

    const replyContent = await createSongProfileEmbed(
      interaction.member,
      target,
    );

    const response = await sendPresetMessage({
      interaction,
      preset: "success",
      deleteIn: duration,
      ...replyContent,
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i) => i.user.id === interaction.user.id,
      time: duration * 1000,
    });

    collector.on("collect", async (buttonInteraction) => {
      if (
        !buttonInteraction.member ||
        !isGuildMember(buttonInteraction.member)
      ) {
        return;
      }

      await buttonInteraction.deferUpdate();

      await container.profiles.actions.toggleLike(
        interaction.user.id,
        target.id,
      );

      await interaction.editReply(
        await createSongProfileEmbed(interaction.member as GuildMember, target),
      );
    });

    collector.on("end", async () => {
      await interaction.deleteReply().catch(noop);
    });
  }
}
