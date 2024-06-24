import { type GuildMember } from "discord.js";

import { isConnectedTo } from "@/music/utils/vc-conditions";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";
import { container } from "@sapphire/framework";

export const destroyPlayerInstance = async (member: GuildMember) => {
  const player = container.xiao.getPlayer(member.guild.id);

  if (player?.voiceId && !isConnectedTo(member, player.voiceId)) {
    throw new FriendlyException(ErrorCodes.NOT_IN_VC);
  }

  await container.xiao.destroyPlayer(
    member.guild,
    "DestroyPlayerInstance called",
  );
};
