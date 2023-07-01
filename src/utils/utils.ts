import { Command } from '@sapphire/framework';
import {
  InteractionEditReplyOptions,
  InteractionReplyOptions,
  MessagePayload,
} from 'discord.js';

import { Locale } from '@/locales/i18n';
import { noop } from '@/utils/dash-utils';

const messages = {
  en_us: [
    'Loading...',
    'Cooking up some good stuff...',
    'Just a sec...',
    'I\'m on it!',
    'I\'m working on it! (I\'m not really) (I\'m just lazy)',
    'Hold on...',
    'You\'re not paying me enough for this...',
    'I\'m doing my best!',
  ],
  pt_br: [
    'Carregando...',
    'Preparando algo especial...',
    'Só um momento...',
    'Estou nisso!',
    'Estou trabalhando nisso! (Não é verdade) (Sou só preguiçoso)',
    'Aguarde um instante...',
    'Você não está me pagando o suficiente para isso...',
    'Estou fazendo o meu melhor!',
  ],
} as const;

export async function sendInteraction(
  interaction: Command.ChatInputCommandInteraction,
  replyOptions: SendInteractionReplyOptions,
  deleteAfter = 0,
) {
  console.log(interaction.deferred, interaction.replied);

  if (interaction.replied) {
    await interaction.editReply(replyOptions);
  } else {
    await interaction.reply(replyOptions as InteractionReplyOptions);
  }

  if (deleteAfter) {
    setTimeout(async () => {
      await interaction.deleteReply().catch(noop);
    }, deleteAfter);
  }
}

export function sendLoadingMessage(
  interaction: Command.ChatInputCommandInteraction,
  locale: Locale = 'en_us',
  deleteAfter = 0,
) {
  const random = Math.floor(Math.random() * messages[locale].length);
  return sendInteraction(interaction, messages[locale][random], deleteAfter);
}

type SendInteractionReplyOptions =
  | InteractionEditReplyOptions
  | InteractionReplyOptions
  | string
  | MessagePayload;
