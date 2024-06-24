import { PermissionFlagsBits } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import { Command, container } from "@sapphire/framework";

import { setupNewChannel } from "@/music/song-channel/setup-new-channel";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { fetchT } from "@/i18n";
import { Embed } from "@/utils/messages";
import { noop } from "@sapphire/utilities";

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

    const t = await fetchT(guild);
    await interaction.deferReply();

    try {
      const songChannel = await setupNewChannel(guild);

      await interaction
        .editReply({
          embeds: Embed.success(
            t("commands:setup.success", {
              channel: songChannel.channel.toString(),
            }),
          ),
        })
        .catch(noop);
    } catch (error) {
      const readableException = t(getReadableException(error));

      await interaction
        .editReply({
          embeds: Embed.error(readableException),
        })
        .catch(() => {
          member
            .send({
              embeds: Embed.error(readableException),
            })
            .catch(noop);
        });
    }
  }
}

void container.stores.loadPiece({
  name: "setup-command",
  piece: SetupCommand,
  store: "commands",
});
