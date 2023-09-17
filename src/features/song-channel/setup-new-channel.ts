import { ChannelType, type Guild } from "discord.js";
import { canSendMessages } from "@sapphire/discord.js-utilities";
import { container } from "@sapphire/framework";
import { noop } from "@sapphire/utilities";

import { Twokei } from "@/app/Twokei";
import { logger } from "@/lib/logger";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";

export const setupNewChannel = async (guild: Guild) => {
  const self = guild.members.me;

  if (!guild || !self || !Twokei.user?.id) {
    throw new FriendlyException(
      "I can't setup the bot in this server, check if I have the correct permissions.",
    );
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

  const newChannel = await guild.channels
    .create({
      name: "twokei-music",
      type: ChannelType.GuildText,
    })
    .catch((e) => {
      logger.error(e);
    });

  if (!newChannel) {
    throw new FriendlyException("I can't create a new channel.");
  }

  if (!canSendMessages(newChannel)) {
    throw new FriendlyException("I can't send messages in the new channel.");
  }

  return newChannel;
};
