import { PermissionFlagsBits } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import { Command } from "@sapphire/framework";

import { setupNewChannel } from "@/features/song-channel/setup-new-channel";
import { setupSongMessage } from "@/features/song-channel/setup-song-message";
import { logger } from "@/modules/logger-transport";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { sendPresetMessage } from "@/utils/utils";

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
      await sendPresetMessage({
        interaction,
        preset: "error",
        message: ErrorCodes.MISSING_ADMIN_PERMISSIONS,
      });
      return;
    }

    await sendPresetMessage({
      preset: "loading",
      interaction,
    });

    try {
      const response = await setupNewChannel(guild);
      const channelId = `<#${response.id}>`;

      await sendPresetMessage({
        interaction,
        preset: "success",
        message: "commands:setup.channel_created",
        i18n: {
          channel: channelId,
        },
      });

      // await setupGuildLanguage(response).catch((e) => {
      //   logger.info("Error while setupGuildLanguage");
      //   logger.error(e);
      // });

      await setupSongMessage(guild, response).catch((e) => {
        logger.info("Error while setupSongMessage");
        logger.error(e);
      });
    } catch (error) {
      await sendPresetMessage({
        interaction,
        preset: "error",
        message: getReadableException(error),
      });
    }
  }
}
