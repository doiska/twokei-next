import { Guild } from 'discord.js';
import { Locale, VALID_LOCALES } from '../i18n/i18n';
import { getGuildSongEntity } from './get-guild-song-channel';
import { isTextChannel } from '@sapphire/discord.js-utilities';
import { createDefaultButtons, createDefaultSongEmbed } from '../music/embed/create-song-embed';
import { kil } from '../app/Kil';
import { guilds } from '../schemas/Guild';
import { eq } from 'drizzle-orm';

export async function setGuildLocale(guild: Guild, locale: Locale) {
  if (!VALID_LOCALES.includes(locale)) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  await kil.insert(guilds).values({
    guildId: guild.id,
    locale: locale,
    name: guild.name
  })
    .onConflictDoUpdate({
      set: {
        locale: locale
      },
      where: eq(guilds.guildId, guild.id),
      target: [guilds.guildId]
    });


  getGuildSongEntity(guild).then(async entity => {
      const channel = await guild.channels.fetch(entity.channelId);

      if (!channel || !isTextChannel(channel)) {
        return;
      }

      const message = await channel.messages.fetch(entity.messageId);

      if (!message) {
        return;
      }

      await message.edit({
        embeds: [await createDefaultSongEmbed(locale)],
        components: createDefaultButtons(locale)
      });
    }
  );
}