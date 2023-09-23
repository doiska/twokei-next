import { Events, type VoiceState } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";
import { logger } from "@/lib/logger";
import { getVoiceStateUpdateType } from "@/utils/voice-state";
import { PlayerState } from "@/music/interfaces/player.types";

@ApplyOptions<Listener.Options>({
  name: "voiceChannelUpdate",
  event: Events.VoiceStateUpdate,
})
export class VoiceChannelUpdate extends Listener {
  public async run(oldState: VoiceState, newState: VoiceState) {
    const guild = newState.guild ?? oldState.guild;
    const updateType = getVoiceStateUpdateType(oldState, newState);

    if (updateType !== "voiceChannelLeave") {
      return;
    }

    const leavingMember = oldState.member;

    if (!leavingMember || !guild.members.me) {
      return;
    }

    const isTwokei = leavingMember.id === guild.members.me?.id;
    const player = container.xiao.getPlayer(guild.id);

    const isDisconecting = [
      PlayerState.DISCONNECTING,
      PlayerState.DISCONNECTED,
      PlayerState.DESTROYING,
      PlayerState.DESTROYED,
    ].includes(player?.state ?? PlayerState.DESTROYED);

    if (isTwokei && isDisconecting) {
      logger.debug(
        `Twokei is already disconnecting from ${guild.name} (${guild.id})`,
      );
      return;
    }

    if (isTwokei) {
      if (!player || isDisconecting) {
        return;
      }

      logger.debug(`Twokei is leaving ${guild.name} (${guild.id})`);
      return container.xiao.destroyPlayer(
        guild,
        "voiceChannelLeave - Twokei leaving",
      );
    }

    const hasTwokei = oldState.channel?.members.has(guild.members.me.id);

    if (!hasTwokei) {
      return;
    }

    setTimeout(() => {
      const connectedMembers = oldState.channel?.members.filter(
        (m) => !m.user.bot,
      );

      const stillConnected = connectedMembers
        ? connectedMembers.size > 0
        : false;

      if (!stillConnected) {
        return container.xiao.destroyPlayer(
          guild,
          "voiceChannelLeave - Twokei was left alone",
        );
      }
    }, 5000);
  }
}
