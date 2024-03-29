import { GuildMember } from "discord.js";
import { container } from "@sapphire/framework";

import { FriendlyException } from "@/structures/exceptions/FriendlyException";

export const previousSong = async (member: GuildMember): Promise<void> => {
  const player = container.xiao.getPlayer(member.guild.id);

  if (!player) {
    throw new FriendlyException("No player found");
  }

  if (!player.queue.previous) {
    throw new FriendlyException("No previous song found");
  }

  await player.play(player.queue.previous, { noReplace: false });
};
