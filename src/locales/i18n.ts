import type { User } from 'discord.js';
import { Guild } from 'discord.js';

import { eq } from 'drizzle-orm';
import { kil } from '@/db/Kil';
import { guilds } from '@/db/schemas/guild';
import { users } from '@/db/schemas/users';

export const VALID_LOCALES = ['pt_br', 'en_us'] as const;

export const LocaleFlags = {
  pt_br: '🇧🇷',
  en_us: '🇺🇸',
};

export type Locale = (typeof VALID_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'pt_br';

export const isValidLocale = (content: string): content is Locale => {
  return VALID_LOCALES.includes(content as Locale);
};

const localeCache = new Map<string, string>();

export async function getLocale (userOrGuild: Guild | User) {
  const prefix = userOrGuild instanceof Guild ? 'guild' : 'user';
  const id = userOrGuild.id;

  const fromCache = localeCache.get(`${prefix}_${id}`);

  if (fromCache) {
    return fromCache;
  }

  if (userOrGuild instanceof Guild) {
    const [{ locale }] = await kil.select({ locale: guilds.locale })
      .from(guilds)
      .where(eq(guilds.guildId, id));

    localeCache.set(`${prefix}_${id}`, locale);

    return locale ?? DEFAULT_LOCALE;
  } else {
    const [{ locale }] = await kil.select({ locale: users.locale })
      .from(users)
      .where(eq(users.id, id));

    localeCache.set(`${prefix}_${id}`, locale);

    return locale ?? DEFAULT_LOCALE;
  }
}
