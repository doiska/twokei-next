import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  type Guild,
  type InteractionButtonComponentData,
  type LinkButtonComponentData,
} from "discord.js";

import { getSourceLogo, Icons } from "@/constants/icons";
import { EmbedButtons, PlayerButtons } from "@/constants/buttons";
import type { Venti } from "@/music/controllers/Venti";

import { fetchT, type TFunction } from "@/i18n";
import { isButton, isButtonLink } from "@/utils/validator";
import { capitalizeFirst } from "@/utils/helpers";

export async function createStaticButtons(guild: Guild) {
  const t = await fetchT(guild);

  const newsButton = new ButtonBuilder({
    customId: EmbedButtons.NEWS,
    label: t(`player:embed.buttons.${EmbedButtons.NEWS}`),
    style: ButtonStyle.Primary,
    emoji: Icons.News,
  });

  const viewRankingButton = new ButtonBuilder({
    customId: EmbedButtons.VIEW_RANKING,
    label: t(`player:embed.buttons.${EmbedButtons.VIEW_RANKING}`),
    style: ButtonStyle.Secondary,
    emoji: Icons.Ranking,
  });

  const viewProfileButton = new ButtonBuilder({
    customId: EmbedButtons.VIEW_PROFILE,
    label: t(`player:embed.buttons.${EmbedButtons.VIEW_PROFILE}`),
    style: ButtonStyle.Secondary,
    emoji: Icons.Premium,
  });

  return new ActionRowBuilder<ButtonBuilder>({
    components: [newsButton, viewRankingButton, viewProfileButton],
  });
}

export async function createDynamicButtons(venti: Venti) {
  const t = await fetchT(venti.guild);

  const capitalizedSourceName = capitalizeFirst(
    venti.queue.current?.sourceName ?? "Source",
  );

  const sourceLogo = getSourceLogo(capitalizedSourceName);

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
      style: ButtonStyle.Secondary,
      emoji: "👍",
      customId: "like",
      label: "Like",
    },
    {
      style:
        venti.loop === "none" ? ButtonStyle.Secondary : ButtonStyle.Primary,
      emoji: "🔁",
      label: t(`player:embed.buttons.loop.${venti.loop}`),
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
      emoji: sourceLogo,
      label: capitalizedSourceName,
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
      button.label ?? t(`player:embed.buttons.${button.customId}` as never),
    style: button?.style ?? ButtonStyle.Secondary,
    type: ComponentType.Button,
  } as InteractionButtonComponentData;
}
