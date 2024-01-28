import type { Xiao } from "@/music/controllers/Xiao";
import type { SongChannelManager } from "@/structures/SongChannels";

import "@total-typescript/ts-reset";

declare module "@sapphire/pieces" {
  interface Container {
    sc: SongChannelManager;
    xiao: Xiao;
  }
}

declare module "discord.js" {
  interface Client {
    xiao: Xiao;
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    ShoukakuReady: never;
    SameVoiceChannelCondition: never;
  }
}

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    returnNull: false;
    returnObjects: false;
    resources: typeof import("@/i18n/locales/pt_br").namespaces;
  }
}
