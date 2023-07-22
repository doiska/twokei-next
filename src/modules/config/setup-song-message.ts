import type { Guild, TextChannel } from 'discord.js';
import { createDefaultSongEmbed, staticPrimaryButtons, useButtons } from '@/music/embed/create-song-embed';
import { container } from '@sapphire/framework';

export async function setupSongMessage (guild: Guild, channel: TextChannel) {
  const newMessage = await channel.send({
    embeds: [await createDefaultSongEmbed(guild)],
    components: await useButtons([staticPrimaryButtons], guild),
  });

  await container.sc.set(guild.id, channel.id, newMessage.id);
}
