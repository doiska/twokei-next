import { formatEmoji } from 'discord.js';

type Emoji<C extends string> = `<:_:${C}>` | `<a:_:${C}>`;

export const RawIcons = {
  SpotifyLogo: {
    id: '1129098176968806440',
  },
  DeezerLogo: {
    id: '1129098175467241492',
  },
  Hanakin: {
    id: '1121884455225786478',
  },
  HanakoEating: {
    id: '1121884717290094652',
    animated: true,
  },
  YoutubeLogo: {
    id: '1129098179288240139',
  },
  Premium: {
    id: '1129096922943197300',
    animated: true,
  },
  News: {
    id: '1141405888700227675',
    animated: true,
  },
  NitroBlack: {
    id: '1141002291076403280',
    animated: true,
  },
} as const;

type KVEmoji = Record<keyof typeof RawIcons, Emoji<typeof RawIcons[keyof typeof RawIcons]['id']>>;

export const Icons: KVEmoji = Object.entries(RawIcons).reduce<any>(
  (acc, [name, icon]) => {
    const isAnimated = 'animated' in icon ? icon.animated : false;
    acc[name] = formatEmoji(icon.id, isAnimated);
    return acc;
  }, {},
);
