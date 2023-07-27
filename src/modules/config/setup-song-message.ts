import type { Guild, TextChannel } from 'discord.js';
import { createDefaultSongEmbed } from '@/music/embed/pieces/create-song-embed';
import { container } from '@sapphire/framework';
import { createStaticButtons } from '@/music/embed/pieces/buttons';

export async function setupSongMessage (guild: Guild, channel: TextChannel) {
  const newMessage = await channel.send({
    embeds: [await createDefaultSongEmbed(guild)],
    components: [await createStaticButtons(guild)],
  });

  await container.sc.set(guild.id, channel.id, newMessage.id);
}
