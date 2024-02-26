import { formatEmoji } from "discord.js";

class Emoji {
  public id?: string;
  public name?: string;
  public animated = false;

  constructor(raw: string | { id: string; animated?: boolean }) {
    if (typeof raw === "string") {
      this.name = raw;
      return;
    }

    this.id = raw.id;
    this.animated = raw.animated ?? false;
  }

  public toString() {
    if (this.name) {
      return this.name;
    }

    if (this.id) {
      return formatEmoji(this.id!, this.animated);
    }

    return "❓";
  }
}

export const getSourceLogo = (source: string) => {
  const icon = {
    spotify: Icons.SpotifyLogo,
    youtube: Icons.YoutubeLogo,
    deezer: Icons.DeezerLogo,
  } as Record<string, { id: string; animated?: boolean }>;

  return icon?.[source.toLowerCase()] ?? Icons.Hanakin;
};

const RawIcons = {
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
  News: "🔔",
};

export const Icons = Object.fromEntries(
  Object.entries(RawIcons).map(([key, value]) => [key, new Emoji(value)]),
) as Record<keyof typeof RawIcons, Emoji>;
