import { type GuildResolvable } from "discord.js";
import { container } from "@sapphire/framework";

import { FriendlyException } from "@/structures/exceptions/FriendlyException";

export const pauseSong = async (guild: GuildResolvable) => {
  const player = container.xiao.getPlayer(guild);

  if (!player) {
    throw new FriendlyException("No player found");
  }

  if (!player.queue.current) {
    throw new FriendlyException("No song is currently playing");
  }

  player.pause();
};
