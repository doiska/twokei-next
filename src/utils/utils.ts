import type {
  InteractionReplyOptions, Message,
  ModalSubmitInteraction,
  RepliableInteraction, ReplyOptions,
} from 'discord.js';
import { container } from '@sapphire/framework';

import { RandomMessages } from '@/constants/random-messages';
import { Embed } from '@/utils/messages';

import { resolveKey } from 'twokei-i18next';

export const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

type PredefinedMessages = 'loading' | 'success' | 'error';

const embedTypes = {
  success: Embed.success,
  error: Embed.error,
  // info: Embed.info,
  // warning: Embed.warning,
  loading: Embed.loading,
} as const;

type PresetMessageFn<T = Exclude<RepliableInteraction, ModalSubmitInteraction> | Message> = {
  interaction: T
  preset: PredefinedMessages
  message?: string
  deleteIn?: number
} & (T extends Message ? ReplyOptions : InteractionReplyOptions);

export async function sendPresetMessage ({
  interaction,
  preset,
  message,
  deleteIn,
  ...props
}: PresetMessageFn) {
  const found = await resolveKey(
    interaction,
    message ?? `messages:${preset}`,
    message ? { joinArrays: '\n' } : { returnObjects: true },
  );

  const randomMessage = Array.isArray(found) ? found[Math.floor(Math.random() * found.length)] : found;
  const embed = embedTypes[preset](randomMessage);

  await container.reply(interaction, {
    embeds: [embed],
    ...props,
  }, deleteIn);
}

// TODO: usar novo meio para gerar as mensagens aleatórias de sucesso e erro
export const getRandomLoadingMessage = () => {
  const random = Math.floor(Math.random() * Object.keys(RandomMessages).length);
  return `messages:${Object.values(RandomMessages)[random]}`;
};

export type Maybe<T> = T | null | undefined;

export function capitalizeFirst (string: string) {
  return string.charAt(0)
    .toUpperCase() + string.slice(1);
}
