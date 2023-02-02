import { createEvent } from 'twokei-framework';
import { ChannelType, VoiceState } from 'discord.js';
import { Twokei } from '../../app/Twokei';

type VoiceChannelUpdateTypes = 'voiceChannelJoin'
  | 'voiceChannelLeave'
  | 'voiceChannelSwitch'
  | 'voiceChannelDeaf'
  | 'voiceChannelMute'
  | 'voiceChannelUnMute'
  | 'voiceChannelUnDeaf'
  | 'voiceUpdate';

export const voiceChannelUpdate = createEvent('voiceStateUpdate', async (oldState, newState) => {

  const guild = newState.guild || oldState.guild;
  const self = guild.members.me;
  const selfVoice = self?.voice;

  const channel = newState.channel || oldState.channel;
  const isConnected = channel?.id === selfVoice?.channel?.id;

  const updateType = getUpdateType(oldState, newState);

  if(updateType === 'voiceChannelLeave') {

    if(!selfVoice || !isConnected) {
      return;
    }

    const isEmpty = oldState.channel?.members.filter((member) => !member.user.bot).size === 0;

    if(!isEmpty) {
      return;
    }

    try {
      await Twokei.xiao.destroyPlayer(newState.guild.id);
    } catch (e) {
      newState.guild.members.me?.voice?.disconnect();
    }
  }
});

function getUpdateType(oldState: VoiceState, newState: VoiceState): VoiceChannelUpdateTypes {
  const oldChannel = oldState.channel;
  const newChannel = newState.channel;

  if(!oldChannel && newChannel) {
    return 'voiceChannelJoin';
  }

  if(oldChannel && !newChannel) {
    return 'voiceChannelLeave';
  }

  if(oldChannel && newChannel && oldChannel.id !== newChannel.id) {
    return 'voiceChannelSwitch';
  }

  if(oldState.deaf && !newState.deaf) {
    return 'voiceChannelUnDeaf';
  }

  if(!oldState.deaf && newState.deaf) {
    return 'voiceChannelDeaf';
  }

  if(oldState.mute && !newState.mute) {
    return 'voiceChannelUnMute';
  }

  if(!oldState.mute && newState.mute) {
    return 'voiceChannelMute';
  }


  return 'voiceUpdate';
}