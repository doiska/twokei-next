export const VALID_LOCALES = ["pt_br"] as const;

export const LocaleFlags = {
  pt_br: "🇧🇷",
  en_us: "🇺🇸",
};

export type Locale = (typeof VALID_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt_br";

export const isValidLocale = (content: string): content is Locale => {
  return VALID_LOCALES.includes(content as Locale);
};
