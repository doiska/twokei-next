import * as fs from 'fs';
import i18next, { Resource, ResourceLanguage } from 'i18next';
import * as path from 'path';

import { logger } from '../modules/logger-transport';
import { getCommand, getCommands } from '../utils/slash-utilities';

export const VALID_LOCALES = ['pt_br', 'en_us'] as const;

export const LocaleFlags = {
  pt_br: '🇧🇷',
  en_us: '🇺🇸'
};

export type Locale = typeof VALID_LOCALES[number];

export const DEFAULT_LOCALE: Locale = 'pt_br';

const resources = VALID_LOCALES.reduce((acc, locale) => {
  const folderPath = path.join(__dirname, 'locales', locale);
  const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

  files.forEach(async file => {
    const key = file.split('.')[0];

    if (!acc[locale]) {
      acc[locale] = {} as ResourceLanguage;
    }
    acc[locale][key] = await import(path.join(folderPath, file)).then(m => m.default);
  });

  logger.debug(`Loaded ${files.length} namespaces for locale ${locale}.`);
  return acc;
}, {} as Resource);

export const init = async () => {

  const commands = getCommands().reduce((acc, command) => {
    acc[`command_${command.name}`] = command.toString();
    return acc;
  }, {} as Record<string, string>);

  return i18next.init({
    resources,
    debug: false,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: VALID_LOCALES,
    saveMissing: true,
    interpolation: {
      defaultVariables: commands
    }
  });
};

export const isValidLocale = (content: string): content is Locale => {
  return VALID_LOCALES.includes(content as Locale);
};