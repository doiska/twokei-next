import {
  ChannelType,
  type Guild,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import { canSendMessages } from "@sapphire/discord.js-utilities";
import { container } from "@sapphire/framework";
import { noop } from "@sapphire/utilities";

import { Twokei } from "@/app/Twokei";
import { logger } from "@/modules/logger-transport";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";

export const setupNewChannel = async (guild: Guild) => {
  const self = guild.members.me;

  if (!guild || !self || !Twokei.user?.id) {
    throw new FriendlyException(
      "I can't setup the bot in this server, check if I have the correct permissions.",
    );
  }

  const selfPermissions = self.permissions;

  const createChannelPermissions = [
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.ManageMessages,
    PermissionsBitField.Flags.SendMessages,
  ];

  const canCreateChannel = createChannelPermissions.every((permission) => {
    console.log(selfPermissions.has(permission), permission);
    return selfPermissions.has(permission);
  });

  if (!canCreateChannel) {
    throw new FriendlyException("I can't create channels in this server.");
  }

  const currentChannel = await container.sc.get(guild);

  if (currentChannel) {
    await guild.channels
      .fetch(currentChannel.channelId)
      .then(async (channel) => {
        await channel?.delete();
      })
      .catch(noop)
      .finally(() =>
        logger.info(`Deleted old ${guild.name} (${guild.id}) song channel.`),
      );
  }

  logger.info("Creating new song channel", {
    guild: { name: guild.name, id: guild.id },
  });

  const newChannel = await guild.channels.create({
    name: "twokei-music",
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: Twokei.user.id,
        allow: [
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.SendMessages,
        ],
      },
    ],
  });

  if (!canSendMessages(newChannel)) {
    throw new FriendlyException("I can't send messages in the new channel.");
  }

  return newChannel;
};
