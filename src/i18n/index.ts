import type {
  InternationalizationHandler,
  InternationalizationOptions,
} from "@/i18n/lib/handler";
import { type NamespacesType } from "@/i18n/locales/pt_br";
import { TFunction } from "i18next";
import { Namespaces } from "@/i18n/lib/functions";

declare module "@sapphire/pieces" {
  interface Container {
    i18n: InternationalizationHandler;
  }
}

declare module "discord.js" {
  export interface ClientOptions {
    i18n?: InternationalizationOptions;
  }
}

declare module "i18next" {
  interface CustomTypeOptions {
    contextSeparator: "-";
    resources: NamespacesType;
  }
}

export * from "./lib/handler";
export * from "./lib/functions";

type NewTFunction = TFunction<Namespaces>;

export { NewTFunction as TFunction };

export { type TOptions } from "i18next";
