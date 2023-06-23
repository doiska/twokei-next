import { Guild } from 'discord.js';

import { isTextChannel } from '@sapphire/discord.js-utilities';

import { eq } from 'drizzle-orm';

import { kil } from '../db/Kil';
import { guilds } from '../db/schemas/Guild';
import { DEFAULT_LOCALE, isValidLocale, Locale, VALID_LOCALES } from '../i18n/i18n';
import { createDefaultButtons, createDefaultSongEmbed } from '../music/embed/create-song-embed';
import { getGuildSongChannel } from './get-guild-song-channel';

export const getGuidLocale = async (guildId: string): Promise<Locale> => {
  const [guild] = await kil.select().from(guilds).where(eq(guilds.guildId, guildId));

  if (!guild || !isValidLocale(guild.locale)) {
    return DEFAULT_LOCALE;
  }

  return guild.locale;
};

export async function setGuildLocale(guild: Guild, locale: Locale) {
  if (!VALID_LOCALES.includes(locale)) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  await kil.insert(guilds).values({
    guildId: guild.id,
    locale: locale,
    name: guild.name
  }).onConflictDoUpdate({
    set: {
      locale: locale
    },
    where: eq(guilds.guildId, guild.id),
    target: [guilds.guildId]
  });

  getGuildSongChannel(guild).then(async entity => {
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