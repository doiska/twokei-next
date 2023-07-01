import { eq } from 'drizzle-orm';

import { kil } from '../db/Kil';
import { guilds } from '../db/schemas/Guild';
import {
  DEFAULT_LOCALE,
  isValidLocale,
  Locale,
} from '../locales/i18n';

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
