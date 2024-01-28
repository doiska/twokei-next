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
  TOptions,
} from "i18next";
import { Maybe } from "@/utils/types-helper";
import { Namespaces } from "@/i18n";

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
  public languages = new Map<string, TFunction<Namespaces>>();

  public fetchLanguage: InternationalizationOptions["fetchLanguage"];

  constructor(public readonly options: InternationalizationOptions) {
    this.fetchLanguage = options.fetchLanguage;
  }

  public async init() {
    await i18next.init({
      initImmediate: false,
      joinArrays: "\n",
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

  public format<
    const Key extends ParseKeys<Ns, TOpt, undefined>,
    const TOpt extends TOptions,
    Ns extends Namespace,
    Ret extends TFunctionReturn<Ns, AppendKeyPrefix<Key, undefined>, TOpt>,
    const ActualOptions extends TOpt & InterpolationMap<Ret> = TOpt &
      InterpolationMap<Ret>,
  >(locale: string, key: Key | Key[], defaultValueOrOptions?: ActualOptions) {
    const fixedT = this.getT(locale);

    return fixedT(key as string, `missing-i18n-${key}`, defaultValueOrOptions);
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
