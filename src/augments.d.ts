import { type Xiao } from "@/music/controllers/Xiao";
import { type SongChannelManager } from "@/structures/SongChannels";

import "@total-typescript/ts-reset";
import { Server } from "@/app/server/server";

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
