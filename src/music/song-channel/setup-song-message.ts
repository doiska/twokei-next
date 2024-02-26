import type { Guild, TextChannel } from "discord.js";
import { container } from "@sapphire/framework";

import { createDefaultEmbed } from "@/music/song-channel/embed/pieces";

export async function setupSongMessage(guild: Guild, channel: TextChannel) {
  const newMessage = await channel.send(await createDefaultEmbed(guild));
  await container.sc.set(guild.id, channel.id, newMessage.id);
}
