import {
  ActionRowBuilder,
  type ButtonBuilder,
  ButtonStyle,
  ComponentType,
  type Guild,
  type InteractionButtonComponentData,
  type LinkButtonComponentData,
} from "discord.js";

import { getSourceLogo, RawIcons } from "@/constants/icons";
import { EmbedButtons, PlayerButtons } from "@/constants/music/player-buttons";
import type { Venti } from "@/music/controllers/Venti";

import { fetchT, type TFunction } from "@sapphire/plugin-i18next";
import { isButton, isButtonLink } from "@/utils/validator";
import { capitalizeFirst } from "@/utils/helpers";

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
        style: ButtonStyle.Link,
        url: `https://twokei.com/profile`,
        label: t(`player:embed.buttons.${EmbedButtons.VIEW_PROFILE}`),
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

  const source = capitalizeFirst(venti.queue.current?.sourceName ?? "Source");
  const emoji = getSourceLogo(source);

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
      customId: venti.playing ? PlayerButtons.PAUSE : PlayerButtons.RESUME,
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
      url: venti.queue?.current?.uri ?? "https://twokei.com",
      style: ButtonStyle.Link,
      emoji: emoji,
      label: source,
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

function parseButtonLabel(
  t: TFunction,
  button: Partial<InteractionButtonComponentData | LinkButtonComponentData>,
) {
  if (isButtonLink(button)) {
    return {
      ...button,
      style: ButtonStyle.Link,
      type: ComponentType.Button,
    } as LinkButtonComponentData;
  }

  if (!isButton(button)) {
    throw new Error("Invalid button provided");
  }

  return {
    ...button,
    label:
      button.label ?? (t(`player:embed.buttons.${button.customId}`) as string),
    style: button?.style ?? ButtonStyle.Secondary,
    type: ComponentType.Button,
  } as InteractionButtonComponentData;
}
