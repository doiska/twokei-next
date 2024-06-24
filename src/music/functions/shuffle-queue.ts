import { type GuildMember } from "discord.js";
import { container } from "@sapphire/framework";

import { isConnectedTo } from "@/music/utils/vc-conditions";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";
import { PlayerException } from "@/structures/exceptions/PlayerException";

export const shuffleQueue = async (member: GuildMember): Promise<void> => {
  const player = container.xiao.getPlayer(member.guild.id);

  if (!player) {
    throw new FriendlyException("No player found");
  }

  if (!isConnectedTo(member, player?.voiceId)) {
    throw new PlayerException(ErrorCodes.NOT_IN_VC);
  }

  player.queue.shuffle();
};
