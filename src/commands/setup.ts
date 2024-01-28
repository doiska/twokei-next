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
import { resolveKey } from "@/i18n";
import { Embed } from "@/utils/messages";
import { noop } from "@sapphire/utilities";
import { EmbedButtons } from "@/constants/music/player-buttons";
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
      builder.setName(this.name).setDescription(this.description),
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const { member, guild } = interaction;

    if (!guild || !isGuildMember(member)) {
      return;
    }

    const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);

    if (!isAdmin) {
      await send(interaction, {
        embeds: Embed.error(
          await resolveKey(interaction, ErrorCodes.MISSING_ADMIN_PERMISSIONS),
        ),
        ephemeral: true,
      });
      return;
    }

    await defer(interaction);

    try {
      const newChannel = await setupNewChannel(guild);

      //TODO: improve error handling here
      await setupSongMessage(guild, newChannel);

      const row = new ActionRowBuilder<ButtonBuilder>({
        components: [
          new ButtonBuilder()
            .setCustomId("delete-setup-message")
            .setLabel("Entendi, valeu!")
            .setEmoji(Icons.Lightning)
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(EmbedButtons.NEWS)
            .setLabel("Ver novidades")
            .setEmoji(Icons.News)
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setURL("https://discord.gg/twokei")
            .setLabel("Preciso de ajuda")
            .setEmoji(Icons.Hanakin)
            .setStyle(ButtonStyle.Link),
        ],
      });

      //TODO: i18n
      const setupMessage = await newChannel.send({
        content: member.user.toString(),
        embeds: Embed.info(
          await resolveKey(interaction, "commands:setup.channel_created", {
            channel: newChannel.toString(),
            user: member.user.toString(),
            serverName: guild.name,
            mention: container.client.user?.toString() ?? "@Twokei",
          }),
        ),
        components: [row],
      });

      setupMessage
        .awaitMessageComponent({
          filter: (i) => i.customId === "delete-setup-message",
          time: 120 * 1000,
          componentType: ComponentType.Button,
        })
        .then(async (i) => {
          await i.deferUpdate();
          await setupMessage.delete();
        })
        .catch(() => setupMessage.delete().catch(noop));

      await interaction.deleteReply().catch(noop);
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
