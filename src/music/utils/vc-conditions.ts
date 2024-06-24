import { type GuildMember } from "discord.js";

import { type Maybe } from "@/utils/types-helper";

export function isConnectedTo(member: GuildMember, channel: Maybe<string>) {
  return member.voice.channel?.id === channel;
}
