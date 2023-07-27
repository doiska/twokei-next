import { type TFunction } from 'twokei-i18next';

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

export function parseButtonLabel<T> (t: TFunction, button: T & { customId: string }): T {
  return {
    ...button,
    label: t(button.customId ?? '') ?? '',
  };
}
