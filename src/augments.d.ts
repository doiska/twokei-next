// eslint-disable-next-line import/no-extraneous-dependencies
import '@total-typescript/ts-reset';
import type { SongProfileManager } from '@/structures/SongProfile';
import type { SongChannelManager } from '@/structures/SongChannels';
import type { Xiao } from '@/music/controllers/Xiao';

declare module '@sapphire/pieces' {
  interface Container {
    sc: SongChannelManager
    xiao: Xiao
    profiles: SongProfileManager
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    SameVoiceChannelCondition: never
  }
}
