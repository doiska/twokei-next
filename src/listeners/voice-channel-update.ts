import { Events, VoiceState } from 'discord.js';
import { container, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

type VoiceChannelUpdateTypes =
    | 'voiceChannelJoin'
    | 'voiceChannelLeave'
    | 'voiceChannelSwitch'
    | 'voiceChannelDeaf'
    | 'voiceChannelMute'
    | 'voiceChannelUnMute'
    | 'voiceChannelUnDeaf'
    | 'voiceUpdate';

@ApplyOptions<Listener.Options>({
  name: 'voiceChannelUpdate',
  event: Events.VoiceStateUpdate,
})
export class VoiceChannelUpdate extends Listener {
  public async run(oldState: VoiceState, newState: VoiceState) {
    const guild = newState.guild || oldState.guild;
    const self = guild.members.me;
    const selfVoice = self?.voice;

    const channel = newState.channel || oldState.channel;
    const isConnected = channel?.id === selfVoice?.channel?.id;

    const updateType = this.getUpdateType(oldState, newState);

    if (updateType === 'voiceChannelLeave') {
      if (!isConnected) {
        try {
          await container.xiao.destroyPlayer(guild);
        } catch (e) {
          self?.voice?.disconnect();
        }
      }

      if (!selfVoice || !isConnected) {
        return;
      }

      const isEmpty = oldState.channel?.members.filter((member) => !member.user.bot).size
              === 0;

      if (!isEmpty) {
        return;
      }

      try {
        await container.xiao.destroyPlayer(newState.guild);
      } catch (e) {
        newState.guild.members.me?.voice?.disconnect();
      }
    }
  }

  private getUpdateType(
    oldState: VoiceState,
    newState: VoiceState,
  ): VoiceChannelUpdateTypes {
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    if (!oldChannel && newChannel) {
      return 'voiceChannelJoin';
    }

    if (oldChannel && !newChannel) {
      return 'voiceChannelLeave';
    }

    if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
      return 'voiceChannelSwitch';
    }

    if (oldState.deaf && !newState.deaf) {
      return 'voiceChannelUnDeaf';
    }

    if (!oldState.deaf && newState.deaf) {
      return 'voiceChannelDeaf';
    }

    if (oldState.mute && !newState.mute) {
      return 'voiceChannelUnMute';
    }

    if (!oldState.mute && newState.mute) {
      return 'voiceChannelMute';
    }

    return 'voiceUpdate';
  }
}
