import { eq } from 'drizzle-orm';

import {
  DEFAULT_LOCALE,
  isValidLocale,
  Locale,
} from '../locales/i18n';
import { guilds } from '../db/schemas/Guild';
import { kil } from '../db/Kil';

export const getGuidLocale = async (guildId: string): Promise<Locale> => {
  const [guild] = await kil
    .select()
    .from(guilds)
    .where(eq(guilds.guildId, guildId));

  if (!guild || !isValidLocale(guild.locale)) {
    return DEFAULT_LOCALE;
  }

  return guild.locale;
};
