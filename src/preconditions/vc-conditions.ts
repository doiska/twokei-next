import { GuildMember } from 'discord.js';

export const isConnectedTo = (member: GuildMember, channel: string) => member.voice.channel?.id === channel