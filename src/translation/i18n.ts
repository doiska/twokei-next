import i18next, { Resource, ResourceLanguage } from 'i18next';
import * as fs from 'fs';
import * as path from 'path';

export const VALID_LOCALES = ['pt_br', 'en_us'] as const;
export type Locale = typeof VALID_LOCALES[number];

export const DEFAULT_LOCALE: Locale = 'en_us';

const resources = VALID_LOCALES.reduce((acc, locale) => {
  const folderPath = path.join(__dirname, 'locales', locale);
  const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

  files.forEach(file => {
    const key = file.split('.')[0];
    if (!acc[locale]) {
      acc[locale] = {} as ResourceLanguage;
    }
    acc[locale][key] = require(path.join(folderPath, file)).default;
  });

  console.log(`Loaded ${locale} locale with ${files.length} namespaces!`)

  return acc;
}, {} as Resource);

export const init = async () => {
  return i18next.init({
    resources,
    ns: ['common'],
    defaultNS: 'common',
    debug: true,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: VALID_LOCALES,
    saveMissing: true
  });
}

export const isValidLocale = (content: string): content is Locale => {
  return VALID_LOCALES.includes(content as Locale);
}