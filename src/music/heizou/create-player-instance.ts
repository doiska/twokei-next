import { type Guild } from "discord.js";
import { container } from "@sapphire/framework";

import { type VentiInitOptions } from "@/music/interfaces/player.types";

import { fetchLanguage } from "@sapphire/plugin-i18next";

interface InitOptions {
  guild: Guild;
  voiceChannel: string;
}

export async function createPlayerInstance({
  guild,
  voiceChannel,
}: InitOptions) {
  const player = container.xiao.getPlayer(guild.id);

  if (player) {
    return player;
  }

  const playerOptions: VentiInitOptions = {
    guild,
    voiceChannel,
    lang: (await fetchLanguage(guild)) as "pt_br",
    shardId: guild.shardId,
    deaf: true,
  };

  const { message, channel } = (await container.sc.getEmbed(guild)) ?? {};

  if (message && channel) {
    playerOptions.embedMessage = message;
  }

  return await container.xiao.createPlayer(playerOptions);
}
