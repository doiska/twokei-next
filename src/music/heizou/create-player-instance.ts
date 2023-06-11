import { Guild, TextChannel } from 'discord.js';
import { Twokei } from '../../app/Twokei';
import { getGuidLocale } from '../../i18n/guild-i18n';
import { kil } from '../../app/Kil';
import { songChannels } from '../../schemas/SongChannels';
import { eq } from 'drizzle-orm';

interface InitOptions {
  guild: Guild;
  voiceChannel: string;
}

export async function createPlayerInstance({ guild, voiceChannel }: InitOptions) {
  const player = Twokei.xiao.getPlayer(guild.id);

  if (player) {
    return player;
  }

  const [songChannel] = await kil.select().from(songChannels).where(eq(songChannels.guildId, guild.id));

  const newPlayer = await Twokei.xiao.createPlayer({
    guild: guild.id,
    voiceChannel: voiceChannel,
    lang: await getGuidLocale(guild.id)
  });

  if (songChannel) {
    const channel = await guild.channels.fetch(songChannel.channelId) as TextChannel;
    const message = await channel.messages.fetch(songChannel.messageId);

    if (channel && message) {
      await Twokei.xiao.embedManager.create(newPlayer, guild.id, message);
    }
  }

  return newPlayer;
}
