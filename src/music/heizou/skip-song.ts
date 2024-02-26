import { type GuildMember } from "discord.js";
import { container } from "@sapphire/framework";

import { isConnectedTo } from "@/preconditions/vc-conditions";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";

export const skipSong = async (member: GuildMember, amount = 1) => {
  const player = container.xiao.getPlayer(member.guild.id);

  if (!player) {
    throw new FriendlyException("No player found.");
  }

  if (!isConnectedTo(member, player?.voiceId)) {
    throw new FriendlyException("error.not-in-vc");
  }

  if (Number.isNaN(amount)) {
    throw new FriendlyException("Amount is not a number.");
  }

  if (player.queue.length < amount) {
    throw new FriendlyException("There are not enough songs in the queue.");
  }

  return player.skip(amount);
};
