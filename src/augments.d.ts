import type { Xiao } from "@/music/controllers/Xiao";
import type { SongChannelManager } from "@/structures/SongChannels";
import type { Server } from "@/http/server";

import "@total-typescript/ts-reset";

declare module "@sapphire/pieces" {
  interface Container {
    sc: SongChannelManager;
    xiao: Xiao;
    server: Server;
  }
}

declare module "discord.js" {
  interface Client {
    server: Server;
    xiao: Xiao;
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    ShoukakuReady: never;
    SameVoiceChannelCondition: never;
  }
}
