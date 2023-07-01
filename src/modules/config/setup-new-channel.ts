import { canSendMessages } from '@sapphire/discord.js-utilities';
import { ChannelType, Guild, PermissionFlagsBits } from 'discord.js';

import { eq } from 'drizzle-orm';
import { Twokei } from '@/app/Twokei';
import { kil } from '@/db/Kil';
import { songChannels } from '@/db/schemas/SongChannels';
import {
  createDefaultButtons,
  createDefaultSongEmbed,
} from '@/music/embed/create-song-embed';
import { FriendlyException } from '@/structures/exceptions/FriendlyException';
import { noop } from '@/utils/dash-utils';
import {
  canCreateChannels,
} from '@/utils/discord-utilities';

import { setupGuildLanguage } from './setup-guild-language';

export const setupNewChannel = async (guild: Guild) => {
  const self = guild.members.me;

  if (!guild || !self || !Twokei.user?.id) {
    throw new FriendlyException(
      "I can't setup the bot in this server, check if I have the correct permissions.",
    );
  }

  if (!canCreateChannels(guild)) {
    throw new FriendlyException("I can't create channels in this server.");
  }

  const [currentChannel] = await kil
    .select()
    .from(songChannels)
    .where(eq(songChannels.guildId, guild.id));

  if (currentChannel) {
    await guild.channels
      .fetch(currentChannel.channelId)
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

  const response = await setupGuildLanguage(newChannel);

  const newMessage = await newChannel.send({
    embeds: [await createDefaultSongEmbed(response)],
    components: createDefaultButtons(response),
  });

  await kil
    .insert(songChannels)
    .values({
      guildId: newChannel.guild.id,
      channelId: newChannel.id,
      messageId: newMessage.id,
    })
    .onConflictDoUpdate({
      set: {
        channelId: newChannel.id,
        messageId: newMessage.id,
      },
      target: [songChannels.guildId],
    });

  return newChannel;
};
