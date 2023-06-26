import {getFixedT} from 'i18next';

import {ButtonStyle, GuildMember} from 'discord.js';

import {Venti} from '@/music/controllers/Venti';
import {destroyPlayerInstance} from '@/music/heizou/destroy-player-instance';
import {pauseSong} from '@/music/heizou/pause-song';
import {previousSong} from '@/music/heizou/previous-song';
import {setLoopState} from '@/music/heizou/set-loop-state';
import {shuffleQueue} from '@/music/heizou/shuffle-queue';
import {skipSong} from '@/music/heizou/skip-song';

export enum Menus {
    SelectSongMenu = 'SELECT_SONG_MENU',
}

export interface Button {
    execute?: (userOrGuildId: GuildMember) => Promise<unknown>
    emoji?: string;
    style?: ButtonStyle;
    disabled?: boolean;
    label?: string;
    url?: string;
}

export const DynamicDefaultButtons = {
  SYNC_PLAYLIST: {
    emoji: ':spotify_dark:1077441343456018463',
    style: ButtonStyle.Success,
  },
  DONATE: {
    label: 'Donate',
    emoji: '<:pray:1077449609447751791>',
    style: ButtonStyle.Link,
    url: 'https://ko-fi.com/doiska',
  },
};

export const DynamicPlaylistButtons = {
  SYNC_PLAYLIST: {
    emoji: ':spotify_dark:1077441343456018463',
    style: ButtonStyle.Success,
    disabled: true
  }
};

export const DynamicPrimaryButtons = (player?: Venti): Record<string, Button> => {

  const t = getFixedT(player?.locale ?? 'pt_br', 'player');

  return {
    STOP: {
      emoji: '⏹️',
      style: ButtonStyle.Secondary,
      execute: destroyPlayerInstance
    },
    PREVIOUS: {
      emoji: '⏮️',
      style: ButtonStyle.Secondary,
      disabled: !player?.queue.previous,
      execute: previousSong
    },
    PAUSE: {
      label: t(player?.paused ? 'embed.buttons.resume' : 'embed.buttons.pause') || 'Pause',
      emoji: player?.paused ? '▶️' : '⏸️',
      style: player?.paused ? ButtonStyle.Primary : ButtonStyle.Secondary,
      execute: pauseSong
    },
    SKIP: {
      emoji: '⏭️',
      style: ButtonStyle.Secondary,
      disabled: !player?.queue.totalSize,
      execute: skipSong
    }
  };
};

export const DynamicSecondaryButtons = (player?: Venti): Record<string, Button> => {
  const t = getFixedT(player?.locale ?? 'pt_br', 'player');

  return {
    SHUFFLE: {
      emoji: '🔀',
      style: ButtonStyle.Secondary,
      execute: shuffleQueue
    },
    LOOP: {
      label: t(`embed.buttons.loop_${player?.loop.toLowerCase()}`) || 'Loop',
      emoji: '🔁',
      style: player?.loop === 'none' ? ButtonStyle.Secondary : ButtonStyle.Primary,
      execute: setLoopState
    }
  };
};
