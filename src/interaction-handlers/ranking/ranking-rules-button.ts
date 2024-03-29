import { ApplyOptions } from "@sapphire/decorators";
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { isValidCustomId } from "@/utils/helpers";
import type { ButtonInteraction } from "discord.js";
import { resolveKey } from "@/i18n";
import { send } from "@/lib/message-handler";
import { Colors, EmbedBuilder } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  name: "ranking-rules-button",
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class RankingRulesButtonInteraction extends InteractionHandler {
  public override async run(interaction: ButtonInteraction): Promise<void> {
    const rules = await resolveKey(interaction, "interactions:ranking.rules");

    const embed = new EmbedBuilder()
      .setColor(Colors.Blue)
      .setDescription(rules);

    await send(interaction, {
      embeds: [embed],
    }).dispose();
  }

  public override async parse(interaction: ButtonInteraction) {
    return isValidCustomId(interaction.customId, "ranking-rules-button");
  }
}

void container.stores.loadPiece({
  name: "ranking-rules-button",
  piece: RankingRulesButtonInteraction,
  store: "interaction-handlers",
});
