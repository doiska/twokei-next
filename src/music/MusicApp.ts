import { GuildMember } from "discord.js";
import { ExtendedClient } from "../structures/ExtendedClient";
import { ExtendedPlayer } from "../structures/ExtendedPlayer";
import { PlayerException } from "../structures/PlayerException";

type Connect = {
  member: GuildMember;
  guild: GuildMember["guild"];
}

enum MusicResponse {
  NO_NODE = "No node available",
  NO_SONG = "No song found",
  NO_GUILD = "No guild found",
  NO_VOICE_CHANNEL = "You must be in a voice channel",
  PLAYLIST_ADDED = "Playlist added to queue",
  SONG_ADDED = "Song added to queue",
}

export class MusicApp {

  constructor(private readonly client: ExtendedClient) {
  }

  async connect({ member, guild }: Connect): Promise<ExtendedPlayer> {

    if (!member || !guild) {
      throw new PlayerException("No member or guild");
    }

    const currentPlayer = this.getPlayer(guild.id);

    if (currentPlayer && currentPlayer.connection.channelId === member.voice.channelId) {
      return currentPlayer as ExtendedPlayer;
    }

    const node = this.client.shoukaku.getNode();

    if (!node) {
      throw new PlayerException('No node available');
    }

    const voice = (member as GuildMember)?.voice?.channel;

    if (!guild || !guild.id || !voice) {
      throw new PlayerException('You must be in a voice channel to use this command');
    }

    if (currentPlayer) {
      node.leaveChannel(guild.id);
    }

    return await node?.joinChannel({
      channelId: voice.id,
      guildId: guild.id,
      shardId: guild.shardId,
      deaf: true
    }) as ExtendedPlayer;
  }

  async disconnect(guildId: string) {
    this.getNode()?.leaveChannel(guildId);
  }

  getNode() {
    return this.client.shoukaku.getNode();
  }

  getPlayer(guildId: string): ExtendedPlayer | undefined {
    return this.client.shoukaku.getNode()?.players.get(guildId) as ExtendedPlayer;
  }
}