import { ChannelType, GuildMember, PermissionFlagsBits, TextBasedChannel } from 'discord.js';
import { canCreateChannels, canSendMessages } from '../utils/discord-utilities';
import { Twokei } from '../app/Twokei';
import { createDefaultButtons, createDefaultSongEmbed } from '../music/embed/create-song-embed';
import { getGuidLocale } from '../i18n/guild-i18n';
import { kil } from '../app/Kil';
import { songChannels } from '../schemas/SongChannels';
import { eq } from 'drizzle-orm';

export const setupNewChannel = async (channel: TextBasedChannel, member: GuildMember) => {
  const guild = member.guild;
  const self = guild.members.me;

  if (!member || !guild || !self) {
    throw new Error(`I can't setup the bot in this server, check if I have the correct permissions.`);
  }

  if (!canCreateChannels(guild)) {
    throw new Error(`I can't create channels in this server.`);
  }

  const [currentChannel] = await kil.select().from(songChannels).where(eq(songChannels.guildId, guild.id));

  if (currentChannel) {
    if (currentChannel.channelId === channel.id) {
      throw new Error(`You can't use the command in this channel, please use another channel.`);
    }

    guild.channels.fetch(currentChannel.channelId)
      .then(channel => {
        channel?.delete();
      })
      .catch(() => {});
  }

  const newChannel = await guild.channels.create({
    name: 'song-requests',
    type: ChannelType.GuildText,
    permissionOverwrites: [{
      id: Twokei.user!.id,
      allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages]
    }]
  });

  if (!canSendMessages(newChannel)) {
    throw new Error(`I can't send messages in the new channel.`);
  }

  const locale = await getGuidLocale(guild.id);

  const newMessage = await newChannel.send({
    embeds: [await createDefaultSongEmbed(locale)],
    components: createDefaultButtons(locale)
  });

  await kil.insert(songChannels).values({
    guildId: guild.id,
    channelId: newChannel.id,
    messageId: newMessage.id
  }).onConflictDoUpdate({
    set: {
      channelId: newChannel.id,
      messageId: newMessage.id
    },
    target: [songChannels.guildId]
  })

  return newChannel;
}