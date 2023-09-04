import type { Target } from "@sapphire/plugin-i18next";
import { fetchLanguage } from "@sapphire/plugin-i18next";
import ptBR from "date-fns/locale/pt-BR";
import enUS from "date-fns/locale/en-US";

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

export async function getDateLocale(target: Target) {
  const lang = await fetchLanguage(target);

  if (lang === "pt_br") {
    return ptBR;
  }

  return enUS;
}
