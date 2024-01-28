import type {
  InternationalizationHandler,
  InternationalizationOptions,
} from "@/i18n/lib/handler";

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

export * from "./lib/handler";
export * from "./lib/functions";
export { type TFunction, type TOptions } from "i18next";
