import { type GuildMember } from "discord.js";
import { container } from "@sapphire/framework";

import { isConnectedTo } from "@/music/utils/vc-conditions";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";
import type { LoopStates } from "../controllers/Venti";

export const setLoopState = async (
  member: GuildMember,
  loopState?: LoopStates,
): Promise<LoopStates> => {
  const player = container.xiao.getPlayer(member.guild.id);

  if (!player) {
    throw new FriendlyException("No player found");
  }

  if (!isConnectedTo(member, player?.voiceId)) {
    throw new FriendlyException(ErrorCodes.NOT_IN_VC);
  }

  return player.setLoop(loopState);
};
