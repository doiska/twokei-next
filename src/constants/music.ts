import { ButtonStyle, GuildMember } from 'discord.js';
import { skipSong } from '../music/heizou/skip-song';
import { setLoopState } from '../music/heizou/set-loop-state';
import { shuffleQueue } from '../music/heizou/shuffle-queue';
import { previousSong } from '../music/heizou/previous-song';
import { destroyPlayerInstance } from '../music/heizou/destroy-player-instance';
import { pauseSong } from '../music/heizou/pause-song';
import { Venti } from '../music/controllers/Venti';
import { getFixedT } from 'i18next';
import { Locale } from '../translation/i18n';

export enum Menus {
  SelectSongMenu = 'SELECT_SONG_MENU',
}

export type Button = {
  execute: (userOrGuildId: GuildMember) => Promise<unknown>
  emoji?: string;
  style?: ButtonStyle;
  disabled?: boolean;
  label?: string;
  url?: string;
}

export const DynamicDefaultButtons = (locale?: Locale): Record<string, Button> => {
  const t = locale ? getFixedT(locale, 'player') : () => undefined;

  return {
    SELECT_LANGUAGE: {
      label: t('embed.buttons.select_language') || 'Select Language',
      emoji: '🌐',
      style: ButtonStyle.Secondary,
      execute: async () => {
      }
    },
    DONATE: {
      label: t('embed.buttons.donate') || 'Donate',
      emoji: '<:pray:1077449609447751791>',
      style: ButtonStyle.Link,
      url: 'https://ko-fi.com/doiska',
      execute: async () => {

      }
    }
  }
}

export const DynamicPlaylistButtons = (locale?: Locale): Record<string, Button> => {
  const t = locale ? getFixedT(locale, 'player') : () => undefined;

  return {
    LOAD_PLAYLIST: {
      label: t('embed.buttons.your_playlists') || 'View playlists',
      emoji: ':playlist_icon:1077444078234521700',
      style: ButtonStyle.Secondary,
      disabled: true,
      execute: async () => {

      }
    },
    // SAVE_THIS_PLAYLIST: {
    //   label: t('embed.buttons.save_this_playlist') || 'Sync Playlist',
    //   emoji: ':spotify_dark:1077441343456018463',
    //   style: ButtonStyle.Success,
    //   execute: async () => {
    //
    //   }
    // },
    SYNC_PLAYLIST: {
      label: t('embed.buttons.sync_playlist') || 'Sync Playlist',
      emoji: ':spotify_dark:1077441343456018463',
      style: ButtonStyle.Success,
      disabled: true,
      execute: async () => {

      }
    }
  }
}

export const DynamicPrimaryButtons = (player?: Venti): Record<string, Button> => {

  const t = getFixedT(player?.locale ?? 'en_us', 'player');

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
  }
}

export const DynamicSecondaryButtons = (player?: Venti): Record<string, Button> => {
  const t = getFixedT(player?.locale ?? 'en_us', 'player');

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
    // AUTO_PLAY: {
    //   emoji: '🔂',
    //   style: ButtonStyle.Secondary,
    //   execute: async (resolvable) => {
    //
    //   }
    // }
  }
}
