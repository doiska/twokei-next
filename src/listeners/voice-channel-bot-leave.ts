import { Events, type VoiceState } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";
import { getVoiceStateUpdateType } from "@/utils/voice-state";
import { PlayerState } from "@/music/interfaces/player.types";
import { GuildSetup } from "@/listeners/guild-setup";

@ApplyOptions<Listener.Options>({
  name: "voiceChannelLeave",
  event: Events.VoiceStateUpdate,
})
export class VoiceChannelBotLeave extends Listener {
  public async run(oldState: VoiceState, newState: VoiceState) {
    const guild = newState.guild ?? oldState.guild;
    const updateType = getVoiceStateUpdateType(oldState, newState);

    if (!["voiceChannelLeave", "voiceChannelSwitch"].includes(updateType)) {
      return;
    }

    const leavingMember = oldState.member;

    if (!leavingMember || !guild.members.me) {
      return;
    }

    const isTwokei = leavingMember.id === guild.members.me?.id;

    if (!isTwokei) {
      return;
    }

    const player = container.xiao.getPlayer(guild.id);

    const disconnectedPlayerStates = [
      PlayerState.DISCONNECTING,
      PlayerState.DISCONNECTED,
      PlayerState.DESTROYING,
      PlayerState.DESTROYED,
    ];

    if (
      disconnectedPlayerStates.includes(player?.state ?? PlayerState.DESTROYED)
    ) {
      return;
    }

    if (updateType === "voiceChannelLeave") {
      await container.xiao.destroyPlayer(
        guild,
        "voiceChannelLeave - Twokei was kicked",
      );
      return;
    }
  }
}

void container.stores.loadPiece({
  name: "voiceChannelLeave",
  piece: VoiceChannelBotLeave,
  store: "listeners",
});
