import { formatEmoji } from "discord.js";
import { SnowflakeRegex } from "@sapphire/discord-utilities";

type Emoji<C extends string> = `<:_:${C}>` | `<a:_:${C}>`;

export const getSourceLogo = (source: string) => {
  const icon = {
    spotify: RawIcons.SpotifyLogo,
    youtube: RawIcons.YoutubeLogo,
    deezer: RawIcons.DeezerLogo,
  } as Record<string, { id: string; animated?: boolean }>;

  return icon?.[source.toLowerCase()] ?? RawIcons.Hanakin;
};

export const RawIcons = {
  SpotifyLogo: {
    id: "1129098176968806440",
  },
  DeezerLogo: {
    id: "1129098175467241492",
  },
  Hanakin: {
    id: "1121884455225786478",
  },
  HanakoEating: {
    id: "1121884717290094652",
    animated: true,
  },
  YoutubeLogo: {
    id: "1129098179288240139",
  },
  Premium: {
    id: "1129096922943197300",
    animated: true,
  },
  News: {
    id: "🔔",
  },
  Ranking: {
    id: "1145760481555009556",
    animated: true,
  },
  NitroBlack: {
    id: "1141002291076403280",
    animated: true,
  },
  Lightning: {
    id: "1121849523854118973",
    animated: true,
  },
} as const;

type KVEmoji = Record<
  keyof typeof RawIcons,
  Emoji<(typeof RawIcons)[keyof typeof RawIcons]["id"]>
>;

export const Icons: KVEmoji = Object.entries(RawIcons).reduce<any>(
  (acc, [name, icon]) => {
    const isAnimated = "animated" in icon ? icon.animated : false;
    const isSnowflake = SnowflakeRegex.test(icon.id);

    acc[name] = isSnowflake ? formatEmoji(icon.id, isAnimated) : icon.id;
    return acc;
  },
  {},
);
