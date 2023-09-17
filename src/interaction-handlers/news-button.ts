import type { APIEmbed, ButtonInteraction } from "discord.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  chatInputApplicationCommandMention,
  EmbedBuilder,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
  type None,
  type Option,
} from "@sapphire/framework";

import { EmbedButtons } from "@/constants/music/player-buttons";

import { fetchT } from "@sapphire/plugin-i18next";
import { RawIcons } from "@/constants/icons";
import { send } from "@/lib/message-handler";

@ApplyOptions<InteractionHandler.Options>({
  name: "news-button",
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class NewsButtonInteraction extends InteractionHandler {
  public async run(interaction: ButtonInteraction): Promise<void> {
    const t = await fetchT(interaction);

    const [profileCommandName, profileCommandId] = [
      ...container.applicationCommandRegistries
        .acquire("profile")
        .chatInputCommands.values(),
    ];
    const [topCommandName, topCommandId] = [
      ...container.applicationCommandRegistries
        .acquire("top")
        .chatInputCommands.values(),
    ];

    const newsText: APIEmbed = t("news:embed", {
      returnObjects: true,
      command_profile: profileCommandName
        ? chatInputApplicationCommandMention(
            profileCommandName,
            profileCommandId,
          )
        : "/profile",
      command_ranking: topCommandName
        ? chatInputApplicationCommandMention(topCommandName, topCommandId)
        : "/top",
    });

    const newsEmbed = EmbedBuilder.from(newsText);

    const donatorButton = new ButtonBuilder()
      .setLabel(t("news:buttons.donator"))
      .setStyle(ButtonStyle.Link)
      .setURL("https://twokei.com")
      .setEmoji(RawIcons.Premium);

    const row = new ActionRowBuilder<ButtonBuilder>({
      components: [donatorButton],
    });

    await send(interaction, {
      embeds: [newsEmbed],
      components: [row],
      ephemeral: true,
    });
  }

  public parse(interaction: ButtonInteraction): Option<None> {
    if (interaction.customId !== EmbedButtons.NEWS) {
      return this.none();
    }

    return this.some();
  }
}
