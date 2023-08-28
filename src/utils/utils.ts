import type {
  InteractionReplyOptions,
  Message,
  ModalSubmitInteraction,
  RepliableInteraction,
  ReplyOptions,
} from "discord.js";
import { container } from "@sapphire/framework";

import { Embed } from "@/utils/messages";

import { resolveKey, type TOptions } from "twokei-i18next";

export const escapeRegExp = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const embedTypes = {
  success: Embed.success,
  error: Embed.error,
  // info: Embed.info,
  // warning: Embed.warning,
  loading: Embed.loading,
} as const;

type PresetMessageFn<
  T = Exclude<RepliableInteraction, ModalSubmitInteraction> | Message,
> = {
  interaction: T;
  preset: keyof typeof embedTypes;
  message?: string;
  i18n?: TOptions & { joinArrays?: string | boolean };
  deleteIn?: number;
} & (T extends Message ? ReplyOptions : InteractionReplyOptions);

export async function sendPresetMessage({
  interaction,
  preset,
  message,
  deleteIn,
  i18n,
  ...props
}: PresetMessageFn) {
  const defaultOptions = message
    ? { joinArrays: "\n" }
    : { joinArrays: false, returnObjects: true };

  const found = await resolveKey(
    interaction,
    message ?? `messages:${preset}`,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    {
      ...defaultOptions,
      ...i18n,
    },
  );

  if (!message) {
    const randomMessage = Array.isArray(found)
      ? found[Math.floor(Math.random() * found.length)]
      : found;
    const embed = embedTypes[preset](randomMessage);

    return await container.reply(
      interaction,
      {
        embeds: [embed],
        ...props,
      },
      deleteIn,
    );
  }

  const embed = embedTypes[preset ?? "success"](found);

  return await container.reply(
    interaction,
    {
      embeds: [embed],
      ...props,
    },
    deleteIn,
  );
}

export type Maybe<T> = T | null | undefined;

export function capitalizeFirst(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
