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
  if(!Twokei.user?.id) {
    return;
  }

  const updateType = getUpdateType(oldState, newState);

  console.log(`Voice channel update: ${updateType}`);
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