import {
  ChannelType, type Guild, PermissionFlagsBits, PermissionsBitField,
} from 'discord.js';
import { container } from '@sapphire/framework';
import { canSendMessages } from '@sapphire/discord.js-utilities';

import { noop } from '@/utils/utils';
import { FriendlyException } from '@/structures/exceptions/FriendlyException';
import {
  createDefaultSongEmbed, staticPrimaryButtons, useButtons,
} from '@/music/embed/create-song-embed';
import { Twokei } from '@/app/Twokei';

import { setupGuildLanguage } from './setup-guild-language';

export const setupNewChannel = async (guild: Guild) => {
  const self = guild.members.me;

  if (!guild || !self || !Twokei.user?.id) {
    throw new FriendlyException(
      "I can't setup the bot in this server, check if I have the correct permissions.",
    );
  }

  const selfPermissions = self.permissions;

  const createChannelPermissions = [PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.ManageMessages,
    PermissionsBitField.Flags.SendMessages];

  const canCreateChannel = createChannelPermissions.every((permission) => {
    return selfPermissions.has(permission);
  });

  if (!canCreateChannel) {
    throw new FriendlyException("I can't create channels in this server.");
  }

  const currentChannel = await container.sc.get(guild);

  if (currentChannel) {
    await guild.channels
      .fetch(currentChannel.channelId)
    // eslint-disable-next-line no-void
      .then((channel) => void channel?.delete())
      .catch(noop);
  }

  const newChannel = await guild.channels.create({
    name: 'song-requests',
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

  await setupGuildLanguage(newChannel);

  const newMessage = await newChannel.send({
    embeds: [await createDefaultSongEmbed(guild)],
    components: await useButtons([staticPrimaryButtons], guild),
  });

  await container.sc.set(guild.id, newChannel.id, newMessage.id);

  return newChannel;
};
