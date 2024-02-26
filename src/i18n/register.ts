import "./index";
import {
  container,
  Plugin,
  preGenericsInitialization,
  preLogin,
  SapphireClient,
} from "@sapphire/framework";
import { ClientOptions } from "discord.js";
import { InternationalizationHandler } from "@/i18n/lib/handler";

export class I18nHook extends Plugin {
  public static [preGenericsInitialization](
    this: SapphireClient,
    options: ClientOptions,
  ) {
    if (!options.i18n) {
      this.logger.warn("No i18n options provided, skipping initialization.");
      return;
    }

    container.i18n = new InternationalizationHandler(options.i18n);
  }

  public static async [preLogin](this: SapphireClient) {
    await container.i18n.init();
  }
}

SapphireClient.plugins.registerPostInitializationHook(
  I18nHook[preGenericsInitialization],
  "i18n-postInitialization",
);
SapphireClient.plugins.registerPreLoginHook(
  I18nHook[preLogin],
  "i18n-preLogin",
);
