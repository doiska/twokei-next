import { Events, VoiceBasedChannel, type VoiceState } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";
import { getVoiceStateUpdateType } from "@/utils/voice-state";

@ApplyOptions<Listener.Options>({
  name: "voiceChannelUserUpdate",
  event: Events.VoiceStateUpdate,
})
export class VoiceChannelUserUpdate extends Listener {
  public async run(oldState: VoiceState, newState: VoiceState) {
    const guild = newState.guild ?? oldState.guild;
    const updateType = getVoiceStateUpdateType(oldState, newState);

    if (
      updateType !== "voiceChannelSwitch" &&
      updateType !== "voiceChannelLeave"
    ) {
      return;
    }

    const member = oldState.member;

    if (!member || !guild.members.me) {
      return;
    }

    const isTwokei = member.id === guild.members.me?.id;

    if (isTwokei) {
      return;
    }

    const newChannel = newState.channel;
    const oldChannel = oldState.channel;

    this.checkDestroy(oldChannel);
    this.checkDestroy(newChannel);
  }

  private checkDestroy(voiceChannel: VoiceBasedChannel | null) {
    if (!voiceChannel) {
      return;
    }

    if (!this.hasTwokei(voiceChannel)) {
      return;
    }

    if (!this.isAlone(voiceChannel)) {
      return;
    }

    setTimeout(() => {
      if (this.isAlone(voiceChannel)) {
        container.xiao.destroyPlayer(
          voiceChannel.guild,
          "voiceChannelUpdate - Twokei is alone",
        );
      }
    }, 5000);
  }

  private isAlone(channel?: VoiceBasedChannel) {
    if (!channel) {
      return false;
    }

    return channel.members.filter((member) => !member.user.bot).size === 0;
  }

  private hasTwokei(channel?: VoiceBasedChannel | null) {
    if (!channel || !channel.guild.members.me) {
      return false;
    }

    return channel.members.has(channel.guild.members.me.id);
  }
}

void container.stores.loadPiece({
  name: "voiceChannelUserUpdate",
  piece: VoiceChannelUserUpdate,
  store: "listeners",
});
