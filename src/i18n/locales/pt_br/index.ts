import commands from "@/i18n/locales/pt_br/commands";
import common from "@/i18n/locales/pt_br/common";
import error from "@/i18n/locales/pt_br/error";
import messages from "@/i18n/locales/pt_br/messages";
import news from "@/i18n/locales/pt_br/news";
import player from "@/i18n/locales/pt_br/player";
import profile from "@/i18n/locales/pt_br/profile";
import tutorial from "@/i18n/locales/pt_br/tutorial";
import genres from "@/i18n/locales/pt_br/genres";
import ranking from "@/i18n/locales/pt_br/interactions/ranking";

export const namespaces = {
  interactions: {
    ranking,
  },
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
