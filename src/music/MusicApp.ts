import { GuildMember, Interaction } from "discord.js";
import { ExtendedClient } from "../structures/ExtendedClient";
import { ExtendedPlayer } from "../structures/ExtendedPlayer";

type Connect = {
  member: GuildMember;
  guild: GuildMember["guild"];
}

export class MusicApp {

  constructor(private readonly client: ExtendedClient) {}

  async connect({ member, guild }: Connect): Promise<ExtendedPlayer> {
    const node = this.client.shoukaku.getNode();

    if (!node) {
      throw new Error('No node available');
    }

    const voice = (member as GuildMember)?.voice?.channel;

    if (!guild || !guild.id || !voice) {
      throw new Error('You must be in a voice channel to use this command');
    }

    const player = await node?.joinChannel({
      channelId: voice.id,
      guildId: guild.id,
      shardId: guild.shardId,
    });

    return player as ExtendedPlayer;
  }
}