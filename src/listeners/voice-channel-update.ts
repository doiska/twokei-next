import { Events, type VoiceState } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";

type VoiceChannelUpdateTypes =
  | "voiceChannelJoin"
  | "voiceChannelLeave"
  | "voiceChannelSwitch"
  | "voiceChannelDeaf"
  | "voiceChannelMute"
  | "voiceChannelUnMute"
  | "voiceChannelUnDeaf"
  | "voiceUpdate";

@ApplyOptions<Listener.Options>({
  name: "voiceChannelUpdate",
  event: Events.VoiceStateUpdate,
})
export class VoiceChannelUpdate extends Listener {
  public async run(oldState: VoiceState, newState: VoiceState) {
    const guild = newState.guild ?? oldState.guild;
    const updateType = this.getUpdateType(oldState, newState);

    if (updateType !== "voiceChannelLeave") {
      return;
    }

    const leavingMember = oldState.member;

    if (!leavingMember || !guild.members.me) {
      return;
    }

    const isTwokei = guild.members.me.id === leavingMember.id;

    const isEmpty =
      oldState.channel?.members.filter((member) => !member.user.bot).size === 0;

    console.log(`Leaving: empty ${isEmpty} - isTwokei ${isTwokei}`);

    if (isTwokei && isEmpty) {
      return;
    }

    // Se for o Twokei que está saindo, limpar o canal.
    if (isTwokei || isEmpty) {
      console.log("Twokei have been disconnected.");
      await container.xiao.destroyPlayer(newState.guild);
      return;
    }
  }

  private getUpdateType(
    oldState: VoiceState,
    newState: VoiceState,
  ): VoiceChannelUpdateTypes {
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    if (!oldChannel && newChannel) {
      return "voiceChannelJoin";
    }

    if (oldChannel && !newChannel) {
      return "voiceChannelLeave";
    }

    if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
      return "voiceChannelSwitch";
    }

    if (oldState.deaf && !newState.deaf) {
      return "voiceChannelUnDeaf";
    }

    if (!oldState.deaf && newState.deaf) {
      return "voiceChannelDeaf";
    }

    if (oldState.mute && !newState.mute) {
      return "voiceChannelUnMute";
    }

    if (!oldState.mute && newState.mute) {
      return "voiceChannelMute";
    }

    return "voiceUpdate";
  }
}
