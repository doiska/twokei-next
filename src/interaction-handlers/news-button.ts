import type { APIEmbed, ButtonInteraction } from "discord.js";
import { chatInputApplicationCommandMention, EmbedBuilder } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
  type None,
  type Option,
} from "@sapphire/framework";

import { EmbedButtons } from "@/constants/music/player-buttons";
import { sendPresetMessage } from "@/utils/utils";

import { fetchT } from "@sapphire/plugin-i18next";

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

    // const donatorButton = new ButtonBuilder()
    //   .setLabel(t('news:buttons.donator'))
    //   .setCustomId(NewsButtons.DONATE)
    //   .setStyle(ButtonStyle.Primary)
    //   .setEmoji(RawIcons.Premium);
    //
    // const row = new ActionRowBuilder<ButtonBuilder>({ components: [donatorButton] });

    await sendPresetMessage({
      interaction,
      preset: "success",
      ephemeral: true,
      deleteIn: 0,
      embeds: [newsEmbed],
      // components: [row],
    });
  }

  public parse(interaction: ButtonInteraction): Option<None> {
    if (interaction.customId !== EmbedButtons.NEWS) {
      return this.none();
    }

    return this.some();
  }
}
