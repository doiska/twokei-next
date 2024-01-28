import { Guild, TextBasedChannel, User } from "discord.js";
import { Awaitable } from "@sapphire/utilities";
import i18next, {
  AppendKeyPrefix,
  InitOptions,
  InterpolationMap,
  Namespace,
  ParseKeys,
  Resource,
  TFunction,
  TFunctionReturn,
  TFunctionReturnOptionalDetails,
  TOptions,
} from "i18next";
import { Maybe } from "@/utils/types-helper";

export type $Dictionary<T = unknown> = { [key: string]: T };
export type $SpecialObject = object | Array<string | object>;

// Taken from: https://github.com/sapphiredev/plugins/blob/main/packages/i18next/src/lib/InternationalizationHandler.ts

export type ResolvableI18nTarget = {
  guild?: Guild;
  user?: User;
  channel?: TextBasedChannel;
};

export type InternationalizationOptions = {
  i18nOptions: InitOptions & {
    resources: Resource;
  };
  fetchLanguage: (context: ResolvableI18nTarget) => Awaitable<Maybe<string>>;
  defaultLanguage: string;
  defaultMissingKey?: string;
};

export class InternationalizationHandler {
  public isLoaded = false;

  private namespaces = new Set<string>();
  public languages = new Map<string, TFunction>();

  public fetchLanguage: InternationalizationOptions["fetchLanguage"];

  constructor(public readonly options: InternationalizationOptions) {
    this.fetchLanguage = options.fetchLanguage;
  }

  public async init() {
    await i18next.init({
      initImmediate: false,
      ...this.options.i18nOptions,
    });

    const languages = Object.keys(this.options.i18nOptions.resources);

    const namespaces = Object.keys(
      this.options.i18nOptions.resources[this.options.defaultLanguage],
    );

    this.namespaces = new Set(namespaces);

    this.languages = new Map(
      languages.map((language) => [language, i18next.getFixedT(language)]),
    );

    this.isLoaded = true;
  }

  /**
   * Localizes a content given one or more keys and i18next options.
   * @param locale The language to be used.
   * @param key The key or keys to retrieve the content from.
   * @param options The interpolation options.
   * @returns The localized content.
   */
  public format<
    const Key extends ParseKeys<Ns, TOpt, undefined>,
    const TOpt extends TOptions,
    Ns extends Namespace,
    Ret extends TFunctionReturn<Ns, AppendKeyPrefix<Key, undefined>, TOpt>,
    const ActualOptions extends TOpt & InterpolationMap<Ret> = TOpt &
      InterpolationMap<Ret>,
  >(
    locale: string,
    ...[key, defaultValueOrOptions, optionsOrUndefined]:
      | [key: Key | Key[], options?: ActualOptions]
      | [
          key: string | string[],
          options: TOpt & $Dictionary & { defaultValue: string },
        ]
      | [
          key: string | string[],
          defaultValue: string | undefined,
          options?: TOpt & $Dictionary,
        ]
  ): TFunctionReturnOptionalDetails<Ret, TOpt> {
    if (!this.isLoaded)
      throw new Error(
        "Cannot call this method until InternationalizationHandler#init has been called",
      );

    const fixedT = this.languages.get(locale);

    if (!fixedT) {
      throw new ReferenceError("Invalid language provided");
    }

    const defaultValue =
      typeof defaultValueOrOptions === "string"
        ? defaultValueOrOptions
        : this.options.defaultMissingKey
        ? fixedT(this.options.defaultMissingKey, { replace: { key } })
        : "";

    return fixedT<Key, TOpt, Ret, ActualOptions>(
      key,
      defaultValue,
      optionsOrUndefined,
    );
  }

  public getT(locale: string) {
    if (!this.isLoaded) {
      throw new Error("InternationalizationHandler has not been loaded yet.");
    }

    const t = this.languages.get(locale);

    if (!t) {
      throw ReferenceError(`Locale ${locale} is not loaded.`);
    }

    return t;
  }
}
