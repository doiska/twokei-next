import type { Resource } from 'i18next';
import tutorial from '@/locales/pt_br/tutorial';
import player from '@/locales/pt_br/player';
import messages from '@/locales/pt_br/messages';
import error from '@/locales/pt_br/error';
import common from '@/locales/pt_br/common';
import commands from '@/locales/pt_br/commands';

export default {
  common,
  error,
  player,
  tutorial,
  commands,
  messages,
} as Resource & {
  common: typeof common;
  error: typeof error;
  player: typeof player;
};
