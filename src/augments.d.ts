import { SongChannelManager } from '@/music/song-channels/SongChannels';
import { Xiao } from '@/music/controllers/Xiao';

declare module '@sapphire/pieces' {
  interface Container {
    sc: SongChannelManager
    xiao: Xiao;
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    SameVoiceChannelCondition: never
  }
}