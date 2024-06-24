import { ChannelType, type Guild, PermissionFlagsBits } from "discord.js";
import { canSendMessages } from "@sapphire/discord.js-utilities";
import { container } from "@sapphire/framework";

import { Twokei } from "@/app/Twokei";
import { logger } from "@/lib/logger";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";

export async function setupNewChannel(guild: Guild) {
  const self = guild.members.me;

  if (!guild || !self || !Twokei.user?.id) {
    throw new FriendlyException(ErrorCodes.SOMETHING_WENT_REALLY_WRONG);
  }

  await container.sc.delete(guild, true);

  logger.info(
    `Trying to create a new song channel in guild: ${guild.name} (${guild.id})`,
  );

  const newChannel = await guild.channels
    .create({
      name: "twokei-music",
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.members.me!.id,
          allow: [
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
          ],
        },
      ],
    })
    .catch((e) => {
      logger.error(
        `Something went wrong while creating a new channel at ${guild.name} (${guild.id})`,
      );

      logger.error(e);
    });

  if (!newChannel) {
    throw new FriendlyException(ErrorCodes.COULD_NOT_CREATE_CHANNEL);
  }

  logger.info(
    `Successfully created new song channel at ${guild.name} (${guild.id})`,
  );

  if (!canSendMessages(newChannel)) {
    throw new FriendlyException(ErrorCodes.MISSING_PERMISSIONS);
  }

  return newChannel;
}
