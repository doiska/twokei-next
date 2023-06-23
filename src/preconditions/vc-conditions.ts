import { GuildMember } from 'discord.js';

import { Maybe } from '../utils/type-guards';

export const isConnectedTo = (member: GuildMember, channel: Maybe<string>) => member.voice.channel?.id === channel;