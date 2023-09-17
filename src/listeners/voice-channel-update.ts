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

    const isBotLeaving = guild.members.me.id === leavingMember.id;

    const isChannelEmpty =
      oldState.channel?.members.filter((member) => !member.user.bot).size === 0;

    const wasBotConnected = oldState.channel?.members.has(guild.members.me.id);

    if (isBotLeaving) {
      await container.xiao.destroyPlayer(newState.guild);
      return;
    }

    if (isChannelEmpty && wasBotConnected) {
      await container.xiao.destroyPlayer(newState.guild);
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
