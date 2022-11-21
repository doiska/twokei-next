import { GuildMember, Interaction } from "discord.js";
import { ExtendedClient } from "../structures/ExtendedClient";
import { ExtendedPlayer } from "../structures/ExtendedPlayer";
import { Twokei } from "../app/Twokei";

type Connect = {
  member: GuildMember;
  guild: GuildMember["guild"];
}

export class MusicApp extends Map<string, ExtendedPlayer> {

  constructor(private readonly client: ExtendedClient) {
    super();
  }

  async connect({ member, guild }: Connect): Promise<ExtendedPlayer> {

    if(!member || !guild) {
      throw new Error("No member or guild");
    }

    const currentPlayer = this.get(guild.id);

    if(currentPlayer && currentPlayer.voiceChannelOptions.channelId === member.voice.channelId) {
      return currentPlayer;
    }

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

    this.set(guild.id, player as ExtendedPlayer);

    return player as ExtendedPlayer;
  }
}