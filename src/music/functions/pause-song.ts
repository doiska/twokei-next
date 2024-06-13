import { GuildMember } from "discord.js";
import { container } from "@sapphire/framework";

import { FriendlyException } from "@/structures/exceptions/FriendlyException";

export const pauseSong = async (member: GuildMember) => {
  const player = container.xiao.getPlayer(member.guild.id);

  if (!player) {
    throw new FriendlyException("No player found");
  }

  if (!player.queue.current) {
    throw new FriendlyException("No song is currently playing");
  }

  player.pause();
};
