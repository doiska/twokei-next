import { ChannelType, type Guild, PermissionFlagsBits } from "discord.js";
import { canSendMessages } from "@sapphire/discord.js-utilities";

import { Twokei } from "@/app/Twokei";
import { logger } from "@/lib/logger";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { container } from "@sapphire/framework";
import { createDefaultEmbed } from "@/music/song-channel/embed/pieces";

export async function setupNewChannel(guild: Guild) {
  const self = guild.members.me;

  if (!guild || !self || !Twokei.user?.id) {
    throw new FriendlyException(ErrorCodes.SOMETHING_WENT_REALLY_WRONG);
  }

  await container.sc.delete(guild);

  logger.info(
    `Trying to create a new song channel in guild: ${guild.name} (${guild.id})`,
  );

  const newChannel = await guild.channels
    .create({
      name: "twokei-music",
      topic: "music.twokei.com - @Twokei <link/name>",
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
    throw new FriendlyException(ErrorCodes.MISSING_PERMISSIONS);
  }

  logger.info(
    `Successfully created new song channel at ${guild.name} (${guild.id})`,
  );

  if (!canSendMessages(newChannel)) {
    throw new FriendlyException(ErrorCodes.MISSING_PERMISSIONS);
  }

  const message = await newChannel.send(await createDefaultEmbed(guild));
  await container.sc.set(guild.id, newChannel, message);

  return {
    channel: newChannel,
    message,
  };
}
