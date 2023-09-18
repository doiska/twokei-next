import { PermissionFlagsBits } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import { Command } from "@sapphire/framework";

import { setupNewChannel } from "@/features/song-channel/setup-new-channel";
import { setupSongMessage } from "@/features/song-channel/setup-song-message";
import { logger } from "@/lib/logger";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { defer, send } from "@/lib/message-handler";
import { resolveKey } from "@sapphire/plugin-i18next";
import { Embed } from "@/utils/messages";

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
      const channelId = `<#${response.id}>`;

      await send(interaction, {
        embeds: Embed.info(
          await resolveKey(interaction, "commands:setup.channel_created", {
            channel: channelId,
          }),
        ),
      });

      await setupSongMessage(guild, response).catch((e) => {
        logger.info("Error while setupSongMessage");
        logger.error(e);
      });
    } catch (error) {
      await send(interaction, {
        embeds: Embed.error(
          await resolveKey(interaction, getReadableException(error)),
        ),
      });
    }
  }
}
