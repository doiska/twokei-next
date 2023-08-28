import { type GuildResolvable } from "discord.js";
import { container } from "@sapphire/framework";

import { FriendlyException } from "@/structures/exceptions/FriendlyException";

export const previousSong = async (guild: GuildResolvable): Promise<void> => {
  const player = container.xiao.getPlayer(guild);

  if (!player) {
    throw new FriendlyException("No player found");
  }

  if (!player.queue.previous) {
    throw new FriendlyException("No previous song found");
  }

  await player.play(player.queue.previous, { replace: true });
};
