import { VoiceState } from "discord.js";

type VoiceChannelUpdateTypes =
  | "voiceChannelJoin"
  | "voiceChannelLeave"
  | "voiceChannelSwitch"
  | "voiceChannelDeaf"
  | "voiceChannelMute"
  | "voiceChannelUnMute"
  | "voiceChannelUnDeaf"
  | "voiceUpdate";

export function getVoiceStateUpdateType(
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
