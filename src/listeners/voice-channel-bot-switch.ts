import { container, Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Events, VoiceState } from "discord.js";
import { getVoiceStateUpdateType } from "@/utils/voice-state";

@ApplyOptions<Listener.Options>({
  name: "voiceChannelSwitch",
  event: Events.VoiceStateUpdate,
})
export class VoiceChannelBotSwitch extends Listener {
  public async run(oldState: VoiceState, newState: VoiceState) {
    const updateType = getVoiceStateUpdateType(oldState, newState);

    if (updateType !== "voiceChannelSwitch") {
      return;
    }

    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    if (!oldChannel || !newChannel) {
      return;
    }

    const isTwokei = oldState.member?.id === oldState.guild.members.me?.id;

    if (!isTwokei) {
      return;
    }

    const isChannelEmpty =
      newChannel.members.filter((member) => !member.user.bot).size === 0;

    if (isChannelEmpty) {
      setTimeout(() => {
        if (
          newChannel.members.filter((member) => !member.user.bot).size === 0
        ) {
          container.xiao.destroyPlayer(
            newState.guild,
            "voiceChannelSwitch - channelEmpty",
          );
        }
      }, 5000);
    }
  }
}

void container.stores.loadPiece({
  name: "voiceChannelSwitch",
  piece: VoiceChannelBotSwitch,
  store: "listeners",
});
