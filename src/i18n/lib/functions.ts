import { BaseInteraction, Guild, Message, TextBasedChannel } from "discord.js";
import type {
  $Dictionary,
  $SpecialObject,
  ResolvableI18nTarget,
} from "@/i18n/lib/handler";
import { container } from "@sapphire/framework";
import { isGuildBasedChannel } from "@sapphire/discord.js-utilities";
import {
  AppendKeyPrefix,
  DefaultNamespace,
  InterpolationMap,
  Namespace,
  ParseKeys,
  TFunctionReturn,
  TFunctionReturnOptionalDetails,
  TOptions,
} from "i18next";

export type Target = BaseInteraction | Guild | ChannelTarget;
type ChannelTarget = Message | TextBasedChannel;

// Taken from: https://github.com/sapphiredev/plugins/blob/main/packages/i18next/src/lib/InternationalizationHandler.ts

/**
 * Resolves a key and its parameters.
 * @param target The target to fetch the language key from.
 * @param key The i18next key.
 * @param options The options to be passed to TFunction.
 * @returns The data that `key` held, processed by i18next.
 */
export async function resolveKey<
  const Key extends ParseKeys<Ns, TOpt, undefined>,
  const TOpt extends TOptions = TOptions,
  Ret extends TFunctionReturn<
    Ns,
    AppendKeyPrefix<Key, undefined>,
    TOpt
  > = TOpt["returnObjects"] extends true ? $SpecialObject : string,
  Ns extends Namespace = DefaultNamespace,
  const ActualOptions extends TOpt & InterpolationMap<Ret> = TOpt &
    InterpolationMap<Ret>,
>(
  target: Target,
  ...[key, defaultValueOrOptions, optionsOrUndefined]:
    | [key: Key | Key[], options?: ActualOptions]
    | [
        key: string | string[],
        options: TOpt & $Dictionary & { defaultValue: string },
      ]
    | [
        key: string | string[],
        defaultValue: string,
        options?: TOpt & $Dictionary,
      ]
): Promise<TFunctionReturnOptionalDetails<Ret, TOpt>> {
  const parsedOptions =
    typeof defaultValueOrOptions === "string"
      ? optionsOrUndefined
      : defaultValueOrOptions;
  const language =
    typeof parsedOptions?.lng === "string"
      ? parsedOptions.lng
      : await fetchLanguage(target);

  if (typeof defaultValueOrOptions === "string") {
    return container.i18n.format<Key, TOpt, Ns, Ret, ActualOptions>(
      language,
      key,
      defaultValueOrOptions,
      optionsOrUndefined,
    );
  }

  return container.i18n.format<Key, TOpt, Ns, Ret, ActualOptions>(
    language,
    key,
    undefined,
    defaultValueOrOptions,
  );
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
