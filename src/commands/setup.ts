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
import { logger } from "@/lib/logger";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { defer, send } from "@/lib/message-handler";
import { resolveKey } from "@sapphire/plugin-i18next";
import { Embed } from "@/utils/messages";
import { noop } from "@sapphire/utilities";
import { EmbedButtons } from "@/constants/music/player-buttons";
import { Icons, RawIcons } from "@/constants/icons";

@ApplyOptions<Command.Options>({
  name: "setup",
  description: "Setup the bot music channel",
  enabled: true,
  preconditions: ["GuildTextOnly"],
  cooldownDelay: 1_000,
})
export class PlayCommand extends Command {
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
      const response = await setupNewChannel(guild);

      //TODO: improve error handling here
      await setupSongMessage(guild, response).catch((e) => {
        logger.info("Error while setupSongMessage");
        logger.error(e);
      });

      await response
        .send({
          embeds: Embed.info(
            await resolveKey(interaction, "commands:setup.channel_created", {
              channel: response.toString(),
              user: member.user.toString(),
              serverName: guild.name,
              mention: container.client.user?.toString() ?? "@Twokei",
            }),
          ),
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId("delete-setup-message")
                .setLabel("Entendi, valeu!")
                .setEmoji(RawIcons.Lightning)
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId(EmbedButtons.NEWS)
                .setLabel("Ver novidades")
                .setEmoji(Icons.News)
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setURL("https://discord.gg/twokei")
                .setLabel("Preciso de ajuda")
                .setEmoji(RawIcons.Hanakin)
                .setStyle(ButtonStyle.Link),
            ),
          ],
        })
        .then(async (message) => {
          message
            .awaitMessageComponent({
              filter: (i) => i.customId === "delete-setup-message",
              time: 120 * 1000,
              componentType: ComponentType.Button,
            })
            .then(async (i) => {
              await i.deferUpdate().catch(noop);
              await message.delete().catch(noop);
            })
            .catch(() => {
              message.delete().catch(noop);
            });
        });

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
  name: "play-command",
  piece: PlayCommand,
  store: "commands",
});
