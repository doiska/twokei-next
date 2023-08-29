import type { APIEmbed, ButtonInteraction } from "discord.js";
import { chatInputApplicationCommandMention, EmbedBuilder } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
  type None,
  type Option,
} from "@sapphire/framework";

import { EmbedButtons } from "@/constants/music/player-buttons";

import { showRanking } from "@/features/music/ranking";

@ApplyOptions<InteractionHandler.Options>({
  name: "ranking-button",
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class RankingButtonInteraction extends InteractionHandler {
  public async run(interaction: ButtonInteraction): Promise<void> {
    await showRanking(interaction);
  }

  public parse(interaction: ButtonInteraction): Option<None> {
    if (interaction.customId !== EmbedButtons.VIEW_RANKING) {
      return this.none();
    }

    return this.some();
  }
}
