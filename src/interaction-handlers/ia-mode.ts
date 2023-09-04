import { ApplyOptions } from "@sapphire/decorators";
import { InteractionHandler, type Option } from "@sapphire/framework";
import { InteractionHandlerTypes } from "@sapphire/framework";
import type { ButtonInteraction } from "discord.js";
import type { Awaitable } from "@sapphire/utilities";
import { EmbedButtons } from "@/constants/music/player-buttons";
import { addISRCSongs } from "@/music/heizou/add-new-song";
import { getRecommendations } from "@/music/recommendation/get-recommendations";
import { ResolvableTrack } from "@/music/structures/ResolvableTrack";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import { sendPresetMessage } from "@/lib/message-handler/helper";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { EmbedBuilder } from "discord.js";
import { Icons } from "@/constants/icons";

@ApplyOptions<InteractionHandler.Options>({
  name: "ia-mode-button",
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class IaModeInteraction extends InteractionHandler {
  public override async run(interaction: ButtonInteraction) {
    if (!isGuildMember(interaction.member)) {
      return;
    }

    try {
      const recommendations = await getRecommendations(interaction.user.id);

      if (recommendations.status === "error") {
        await sendPresetMessage({
          interaction,
          preset: "error",
          message: "Ocorreu um erro ao buscar as recomendações.",
        });
        return;
      }

      if (recommendations.data.length === 0) {
        await sendPresetMessage({
          interaction,
          preset: "error",
          message:
            "Não possuimos uma amostra grande, continue ouvindo músicas e tente novamente!",
        });
        return;
      }

      const addedSongs = await addISRCSongs(
        recommendations.data.map(
          (rec) =>
            new ResolvableTrack({
              track: "",
              info: {
                identifier: rec.id,
                uri: rec.external_url,
                author: rec.artists[0].name,
                sourceName: "spotify",
                title: rec.name,
                length: rec.duration_ms,
                position: 0,
                isStream: false,
                isSeekable: true,
              },
              isrc: rec.isrc,
            }),
        ),
        interaction.member,
      );

      await sendPresetMessage({
        interaction,
        preset: "success",
        ephemeral: true,
        embeds: [
          new EmbedBuilder().setDescription(
            [
              `### ${Icons.Hanakin} ${addedSongs.length} músicas adicionadas com Modo IA!`,
              `### Você poderá se tornar um ${Icons.Premium} Premium no lançamento do site <t:1694282040:R>.`,
              "**Faça parte da nossa Vibe!**",
            ].join("\n"),
          ),
        ],
      });
    } catch (e) {
      await sendPresetMessage({
        interaction,
        ephemeral: true,
        preset: "error",
        message: getReadableException(e),
      });
    }
  }

  public override parse(
    interaction: ButtonInteraction,
  ): Awaitable<Option<unknown>> {
    if (
      [EmbedButtons.IA_MODE, EmbedButtons.QUICK_PLAYLIST].includes(
        interaction.customId,
      )
    ) {
      return this.some();
    }

    return this.none();
  }
}
