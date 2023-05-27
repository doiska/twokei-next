import { DEFAULT_LOCALE, isValidLocale, Locale } from './i18n';
import i18next, { TOptions } from 'i18next';
import { kil } from '../app/Kil';
import { guilds } from '../schemas/Guild';
import { eq } from 'drizzle-orm';

export const i18nGuild = async (guildId: string, key: string, options?: TOptions) => {
  const locale = await getGuidLocale(guildId);
  return i18next.t(key, { lng: locale, ...options });
}

export const multiI18nGuild = async (guildId: string, keys: string[], options?: TOptions) => {
  const locale = await getGuidLocale(guildId);

  return keys.map(key => i18next.t(key, { lng: locale, ...options }));
}

export const getGuidLocale = async (guildId: string): Promise<Locale> => {
  const [guild] = await kil.select().from(guilds).where(eq(guilds.guildId, guildId));

  if (!guild || !isValidLocale(guild.locale)) {
    return DEFAULT_LOCALE;
  }

  return guild.locale;
}