import {
  ActionRowBuilder,
  APIMessageComponentEmoji,
  ButtonBuilder,
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

export async function createStaticButtons(guild: Guild) {
  const t = await fetchT(guild);

  return new ActionRowBuilder<ButtonBuilder>({
    components: [
      {
        custom_id: EmbedButtons.NEWS,
        label: t(`player:embed.buttons.${EmbedButtons.NEWS}`),
        style: ButtonStyle.Primary,
        type: ComponentType.Button,
      },
      {
        custom_id: EmbedButtons.VIEW_RANKING,
        label: t(`player:embed.buttons.${EmbedButtons.VIEW_RANKING}`),
        style: ButtonStyle.Secondary,
        type: ComponentType.Button,
        emoji: RawIcons.Ranking,
      },
      {
        label: t(`player:embed.buttons.${EmbedButtons.VIEW_PROFILE}`),
        url: `https://twokei.com/profile`,
        style: ButtonStyle.Link,
        type: ComponentType.Button,
        emoji: RawIcons.Premium,
      },
    ],
  });
}

export async function createDynamicButtons(venti: Venti) {
  const t = await fetchT(venti.guild);

  const source = capitalizeFirst(venti.queue.current?.sourceName ?? "Source");
  const emoji = getSourceLogo(source);

  const secondary = [
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
      style: !venti.paused ? ButtonStyle.Secondary : ButtonStyle.Primary,
      emoji: "⏸️",
      customId: !venti.paused ? PlayerButtons.PAUSE : PlayerButtons.RESUME,
    },
    {
      style: ButtonStyle.Secondary,
      emoji: "⏭️",
      customId: PlayerButtons.SKIP,
      disabled: !venti.queue.length,
    },
  ].map((button) => parseButtonLabel(t, button));

  const primary = [
    {
      style: ButtonStyle.Success,
      emoji: "👍",
      customId: "like",
      label: "Like",
    },
    {
      style:
        venti.loop === "none" ? ButtonStyle.Secondary : ButtonStyle.Primary,
      emoji: "🔁",
      label: t(`player:embed.buttons.loop.${venti.loop.toLowerCase()}`),
      customId: PlayerButtons.LOOP,
    },
    {
      style: ButtonStyle.Secondary,
      emoji: "🔁",
      label: "Shuffle",
      customId: PlayerButtons.SHUFFLE,
    },
    {
      url: venti.queue?.current?.uri ?? "https://twokei.com",
      style: ButtonStyle.Link,
      emoji: emoji,
      label: source,
    },
  ].map((button) => parseButtonLabel(t, button));

  return [
    new ActionRowBuilder<ButtonBuilder>({
      components: primary,
    }),
    new ActionRowBuilder<ButtonBuilder>({
      components: secondary,
    }),
  ];
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
