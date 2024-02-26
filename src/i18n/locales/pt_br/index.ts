import commands from "@/i18n/locales/pt_br/commands";
import common from "@/i18n/locales/pt_br/common";
import error from "@/i18n/locales/pt_br/error";
import messages from "@/i18n/locales/pt_br/messages";
import news from "@/i18n/locales/pt_br/news";
import player from "@/i18n/locales/pt_br/player";
import profile from "@/i18n/locales/pt_br/profile";
import tutorial from "@/i18n/locales/pt_br/tutorial";
import interactions from "@/i18n/locales/pt_br/interactions";
import genres from "@/i18n/locales/pt_br/genres";

export const namespaces = {
  interactions,
  common,
  error,
  player,
  tutorial,
  commands,
  messages,
  profile,
  news,
  genres,
} as const;

export type NamespacesType = typeof namespaces;
