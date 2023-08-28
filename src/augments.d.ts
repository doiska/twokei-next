import { type SongProfileManager } from "@/features/song-profile/SongProfileManager";
import { type Xiao } from "@/music/controllers/Xiao";
import { type Analytics } from "@/structures/Analytics";
import { type SongChannelManager } from "@/structures/SongChannels";

import "@total-typescript/ts-reset";

declare module "@sapphire/pieces" {
  interface Container {
    sc: SongChannelManager;
    xiao: Xiao;
    profiles: SongProfileManager;
    analytics: Analytics;
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    SameVoiceChannelCondition: never;
  }
}
