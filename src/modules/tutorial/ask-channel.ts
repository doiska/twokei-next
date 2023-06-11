import { Message } from 'discord.js';
import { Locale } from '../../i18n/i18n';
import i18next from 'i18next';
import { getCommand } from '../../utils/slash-utilities';

export async function askChannel(message: Message, language: Locale) {
  const t = i18next.getFixedT(language, 'common');

  const playCommand = (await getCommand('play'))?.toString() ?? '/play';

}