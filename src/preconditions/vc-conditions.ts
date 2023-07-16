import { type GuildMember, type Message } from 'discord.js';
import { Precondition } from '@sapphire/framework';

import { type Maybe } from '@/utils/utils';

export const isConnectedTo = (member: GuildMember, channel: Maybe<string>) => {
  return member.voice.channel?.id === channel;
};

export class SameVoiceChannelCondition extends Precondition {
  public override async messageRun (message: Message): Promise<any> {
    if (!message.member?.voice?.channel) {
      return await this.error({ message: 'You must be connected to a voice channel to use this command.' });
    }

    if (message.guild?.members.me?.voice.channel?.id !== message.member.voice.channel.id) {
      return await this.error({ message: 'You must be in the same voice channel as me to use this command.' });
    }

    return await this.ok();
  }
}
