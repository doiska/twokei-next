import { BaseInteraction, Guild, Message, TextBasedChannel } from "discord.js";
import type { ResolvableI18nTarget } from "@/i18n/lib/handler";
import { container } from "@sapphire/framework";
import { isGuildBasedChannel } from "@sapphire/discord.js-utilities";
import {
  DefaultNamespace,
  ParseKeys,
  TFunctionReturnOptionalDetails,
  TOptions,
} from "i18next";
import type { FlatNamespace } from "i18next";
import { AppendKeyPrefix, InterpolationMap, TFunctionReturn } from "i18next";

export type Target = BaseInteraction | Guild | ChannelTarget;
type ChannelTarget = Message | TextBasedChannel;

export type $NormalizeIntoArray<T extends unknown | readonly unknown[]> =
  T extends readonly unknown[] ? T : [T];

type InferArrayValuesElseReturnType<T> = T extends (infer A)[] ? A : T;

export type Namespaces = readonly [
  ...$NormalizeIntoArray<DefaultNamespace>,
  ...Exclude<FlatNamespace, InferArrayValuesElseReturnType<DefaultNamespace>>[],
];

export async function resolveKey<
  const Key extends ParseKeys<Ns, TOpt, undefined>,
  const TOpt extends TOptions,
  Ns extends Namespaces,
  Ret extends TFunctionReturn<Ns, AppendKeyPrefix<Key, undefined>, TOpt>,
  const ActualOptions extends TOpt & InterpolationMap<Ret> = TOpt &
    InterpolationMap<Ret>,
>(
  target: Target,
  key: Key | Key[],
  options?: ActualOptions,
): Promise<TFunctionReturnOptionalDetails<Ret, TOpt>> {
  const fixedT = await fetchT(target);

  const defaultValue = Array.isArray(key) ? key[0] : key;

  //ts-expect-error skill issue
  return fixedT(key, {
    ...options,
    defaultValue,
  });
}

export async function fetchT(target: Target) {
  return container.i18n.getT(await fetchLanguage(target));
}

// Discord.js typing sucks
export async function fetchLanguage(target: Target) {
  if (target instanceof BaseInteraction) {
    return resolveLanguage({
      guild: target?.guild ?? undefined,
      channel: target?.channel ?? undefined,
      user: target?.user,
    });
  }

  if (target instanceof Guild) {
    return resolveLanguage({ guild: target });
  }

  if (target instanceof Message) {
    return resolveLanguage({
      guild: target.guild ?? undefined,
      channel: target.channel,
      user: target.author,
    });
  }

  return resolveLanguage({
    guild: isGuildBasedChannel(target) ? target.guild : undefined,
    channel: target,
  });
}

export function getLanguages() {
  if (!container.i18n.isLoaded) {
    throw new Error("InternationalizationHandler has not been loaded yet.");
  }

  return Array.from(container.i18n.languages.keys());
}

export async function isLanguageValid(language: string) {
  if (!container.i18n.isLoaded) {
    throw new Error("InternationalizationHandler has not been loaded yet.");
  }

  return container.i18n.languages.has(language);
}

async function resolveLanguage(context: ResolvableI18nTarget) {
  const language = await container.i18n.fetchLanguage(context);

  return (
    language ??
    context.guild?.preferredLocale ??
    container.i18n.options.defaultLanguage
  );
}
