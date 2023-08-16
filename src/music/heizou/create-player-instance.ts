import { type Guild } from 'discord.js';
import { container } from '@sapphire/framework';

import { xiao } from '@/app/Xiao';
import { type VentiInitOptions } from '@/music/interfaces/player.types';

import { fetchLanguage } from 'twokei-i18next';

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

  const {
    message,
    channel,
  } = await container.sc.getEmbed(guild) ?? {};

  if (message && channel) {
    playerOptions.embedMessage = message;
  }

  return await xiao.createPlayer(playerOptions);
}
