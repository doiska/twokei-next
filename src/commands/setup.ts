import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  PermissionFlagsBits,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import { Command, container } from "@sapphire/framework";

import { setupNewChannel } from "@/music/song-channel/setup-new-channel";
import { setupSongMessage } from "@/music/song-channel/setup-song-message";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { defer, send } from "@/lib/message-handler";
import { fetchT, resolveKey } from "@/i18n";
import { Embed } from "@/utils/messages";
import { noop } from "@sapphire/utilities";
import { EmbedButtons } from "@/constants/buttons";
import { Icons } from "@/constants/icons";

@ApplyOptions<Command.Options>({
  name: "setup",
  description: "Setup the bot music channel",
  enabled: true,
  preconditions: ["GuildTextOnly"],
  cooldownDelay: 10_000,
})
export class SetupCommand extends Command {
  registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const { member, guild } = interaction;

    if (!guild || !isGuildMember(member)) {
      return;
    }

    await interaction.deferReply();

    try {
      const newChannel = await setupNewChannel(guild);
      await setupSongMessage(guild, newChannel);

      await interaction
        .reply({
          embeds: Embed.success(
            await resolveKey(interaction, "commands:setup.success", {
              channel: newChannel.toString(),
            }),
          ),
        })
        .catch(noop);
    } catch (error) {
      await member.send({
        embeds: Embed.error(
          await resolveKey(interaction, getReadableException(error)),
        ),
      });
    }
  }
}

void container.stores.loadPiece({
  name: "setup-command",
  piece: SetupCommand,
  store: "commands",
});
