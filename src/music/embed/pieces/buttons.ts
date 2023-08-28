import {
  ActionRowBuilder,
  type ButtonBuilder,
  ButtonStyle,
  ComponentType,
  type Guild,
  type InteractionButtonComponentData,
} from "discord.js";

import { Icons, RawIcons } from "@/constants/icons";
import {
  EmbedButtons,
  OnPlayButtons,
  PlayerButtons,
} from "@/constants/music/player-buttons";
import type { Venti } from "@/music/controllers/Venti";

import { fetchT, type TFunction } from "twokei-i18next";

function parseButtonLabel<T>(
  t: TFunction,
  button: T & { label?: string; customId: string },
): T & { label: string; customId?: string } {
  return {
    ...button,
    label:
      button.label ??
      t(`player:embed.buttons.${button.customId.toLowerCase()}`),
    type: ComponentType.Button,
  };
}

export async function createStaticButtons(guild: Guild, venti?: Venti) {
  const t = await fetchT(guild);

  const staticPrimaryRow = new ActionRowBuilder<ButtonBuilder>({
    components: [
      {
        style: ButtonStyle.Primary,
        customId: EmbedButtons.NEWS,
        emoji: RawIcons.News.id,
      },
      {
        style: ButtonStyle.Secondary,
        customId: EmbedButtons.VIEW_RANKING,
        emoji: RawIcons.Ranking,
      },
      {
        style: ButtonStyle.Secondary,
        customId: EmbedButtons.VIEW_PROFILE,
        emoji: RawIcons.Premium,
      },
    ].map((button) =>
      parseButtonLabel(t, button),
    ) as InteractionButtonComponentData[],
  });

  const staticSecondaryRow = new ActionRowBuilder<ButtonBuilder>({
    components: [
      {
        style: ButtonStyle.Secondary,
        customId: EmbedButtons.PLAYLIST_SYNC,
        emoji: RawIcons.SpotifyLogo,
      },
      {
        style: ButtonStyle.Secondary,
        emoji: ":a:premium:1129096922943197300",
        customId: venti?.playing
          ? EmbedButtons.IA_MODE
          : EmbedButtons.QUICK_PLAYLIST,
      },
    ].map((button) =>
      parseButtonLabel(t, button),
    ) as InteractionButtonComponentData[],
  });

  return {
    primary: staticPrimaryRow,
    secondary: staticSecondaryRow,
  };
}

export async function createDynamicButtons(venti: Venti) {
  const t = await fetchT(venti.guild);

  const primary = [
    {
      style: ButtonStyle.Secondary,
      emoji: "⏹️",
      customId: PlayerButtons.STOP,
    },
    {
      style: ButtonStyle.Secondary,
      emoji: "⏮️",
      customId: PlayerButtons.PREVIOUS,
      disabled: !venti.queue.previous,
    },
    {
      style: venti.playing ? ButtonStyle.Secondary : ButtonStyle.Primary,
      emoji: "⏸️",
      customId: PlayerButtons.PAUSE,
      label: venti.playing
        ? t("player:embed.buttons.pause")
        : t("player:embed.buttons.resume"),
    },
    {
      style: ButtonStyle.Secondary,
      emoji: "⏭️",
      customId: PlayerButtons.SKIP,
      disabled: !venti.queue.length,
    },
  ].map((button) => parseButtonLabel(t, button));

  const secondary = [
    {
      style: ButtonStyle.Primary,
      emoji: ":a:premium:1129096922943197300",
      customId: venti?.playing
        ? EmbedButtons.IA_MODE
        : EmbedButtons.QUICK_PLAYLIST,
    },
    {
      style:
        venti.loop === "none" ? ButtonStyle.Secondary : ButtonStyle.Primary,
      emoji: "🔁",
      label: t(`player:embed.buttons.loop.${venti.loop.toLowerCase()}`),
      customId: PlayerButtons.LOOP,
    },
    {
      url: "https://spotify.com",
      style: ButtonStyle.Link,
      emoji: RawIcons.SpotifyLogo,
      label: "Spotify",
    },
  ].map((button) => parseButtonLabel(t, button));

  return {
    primary: new ActionRowBuilder<ButtonBuilder>({
      components: primary as InteractionButtonComponentData[],
    }),
    secondary: new ActionRowBuilder<ButtonBuilder>({
      components: secondary as InteractionButtonComponentData[],
    }),
  };
}
