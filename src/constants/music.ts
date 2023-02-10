import { Awaitable, ButtonStyle, GuildMember } from 'discord.js';
import { skipSong } from '../music/heizou/skip-song';
import { setLoopState } from '../music/heizou/set-loop-state';
import { shuffleQueue } from '../music/heizou/shuffle-queue';
import { previousSong } from '../music/heizou/previous-song';
import { destroyPlayerInstance } from '../music/heizou/destroy-player-instance';
import { pauseSong } from '../music/heizou/pause-song';

export enum Menus {
  SelectSongMenu = 'SELECT_SONG_MENU',
}

export type Button = {
  execute: (userOrGuildId: GuildMember) => Promise<unknown>
  emoji?: string;
  style?: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger
}

type ButtonRow = Record<'default' | 'player_primary' | 'player_secondary', Button[]>

export const DefaultButtons: Record<string, Button> = {
  SELECT_LANGUAGE: {
    emoji: '🌐',
    style: ButtonStyle.Secondary,
    execute: async (resolvable) => {

    }
  },
  // SYNC_PLAYLIST: {
  //   emoji: '🔄',
  //   style: ButtonStyle.Success,
  //   execute: async (resolvable) => {
  //
  //   }
  // }
}

export const PlayerPrimaryButtons: Record<string, Button> = {
  STOP: {
    emoji: '⏹️',
    style: ButtonStyle.Danger,
    execute: destroyPlayerInstance
  },
  PREVIOUS: {
    emoji: '⏮️',
    style: ButtonStyle.Secondary,
    execute: previousSong
  },
  PAUSE: {
    emoji: '⏸️',
    style: ButtonStyle.Secondary,
    execute: pauseSong
  },
  SKIP: {
    emoji: '⏭️',
    style: ButtonStyle.Secondary,
    execute: skipSong
  }
}

export const SecondaryButtons: Record<string, Button> = {
  SHUFFLE: {
    emoji: '🔀',
    style: ButtonStyle.Secondary,
    execute: shuffleQueue
  },
  LOOP: {
    emoji: '🔁',
    style: ButtonStyle.Secondary,
    execute: setLoopState
  },
  // AUTO_PLAY: {
  //   emoji: '🔂',
  //   style: ButtonStyle.Secondary,
  //   execute: async (resolvable) => {
  //
  //   }
  // }
}