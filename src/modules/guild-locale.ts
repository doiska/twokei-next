import { kil } from '@/db/Kil';
import { guilds } from '@/db/schemas/guild';
import {
  DEFAULT_LOCALE,
  isValidLocale,
  type Locale,
} from '@/locales/i18n';

import { eq } from 'drizzle-orm';

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
