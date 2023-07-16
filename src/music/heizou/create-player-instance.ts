import { type Guild } from 'discord.js';
import { container } from '@sapphire/framework';
import {
  isGuildBasedChannel,
  isMessageInstance,
  isTextChannel,
} from '@sapphire/discord.js-utilities';

import { fetchLanguage } from 'twokei-i18next';
import { type VentiInitOptions } from '@/music/interfaces/player.types';
import { xiao } from '@/app/Xiao';

interface InitOptions {
  guild: Guild
  voiceChannel: string
}

export async function createPlayerInstance ({
  guild,
  voiceChannel,
}: InitOptions) {
  const player = xiao.getPlayer(guild.id);

  if (player) {
    return player;
  }

  const playerOptions: VentiInitOptions = {
    guild,
    voiceChannel,
    lang: await fetchLanguage(guild) as 'en_us' | 'pt_br',
  };

  const songChannel = await container.sc.get(guild.id);

  if (songChannel) {
    const channel = await guild.channels
      .fetch(songChannel.channelId)
      .catch(() => null);

    if (isGuildBasedChannel(channel) && isTextChannel(channel)) {
      const message = await channel.messages
        .fetch(songChannel.messageId)
        .catch(() => null);

      if (message && isMessageInstance(message)) {
        playerOptions.embedMessage = message;
      }
    }
  }

  return await xiao.createPlayer(playerOptions);
}
