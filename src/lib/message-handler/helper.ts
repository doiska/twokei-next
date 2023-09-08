import { resolveKey } from "@sapphire/plugin-i18next";
import type {
  InteractionReplyOptions,
  Message,
  ModalSubmitInteraction,
  RepliableInteraction,
  ReplyOptions,
} from "discord.js";
import { Embed } from "@/utils/messages";
import { send } from "@/lib/message-handler/index";

const embedTypes = {
  success: Embed.success,
  error: Embed.error,
  loading: Embed.loading,
} as const;

type Preset = keyof typeof embedTypes;

interface I18nOptions {
  joinArrays?: string | undefined;
  [key: string]: any; // Assuming i18n options can have other properties
}

type PresetMessageOptions<T> = {
  interaction: Exclude<RepliableInteraction, ModalSubmitInteraction> | Message;
  preset: Preset;
  message?: string;
  i18n?: I18nOptions;
  deleteIn?: number;
} & (T extends Message ? ReplyOptions : InteractionReplyOptions);

function determineContent(found: string | string[], message?: string): string {
  if (message) {
    return found as string;
  }

  if (Array.isArray(found)) {
    return found[Math.floor(Math.random() * found.length)];
  }

  return found as string;
}

export async function sendPresetMessage<T>({
  interaction,
  preset,
  message,
  deleteIn = 15,
  i18n,
  ...props
}: PresetMessageOptions<T>) {
  // @ts-expect-error - I18nOptions type is not correct
  const defaultOptions: I18nOptions = message
    ? { joinArrays: "\n" }
    : { joinArrays: false, returnObjects: true };

  const found = await resolveKey(interaction, message ?? `messages:${preset}`, {
    ...defaultOptions,
    ...i18n,
  });

  const content: string = determineContent(found, message);
  const embed = embedTypes[preset ?? "success"](content);

  const disposalTime = (() => {
    if (deleteIn === 0) return undefined;
    if (deleteIn > 1000) return deleteIn;
    return deleteIn * 1000;
  })();

  return send(interaction, { embeds: [embed], ...props }).dispose(disposalTime);
}
