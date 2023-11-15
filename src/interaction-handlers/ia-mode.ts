import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
  type Option,
} from "@sapphire/framework";
import type { ButtonInteraction } from "discord.js";
import { EmbedBuilder } from "discord.js";
import type { Awaitable } from "@sapphire/utilities";
import { EmbedButtons } from "@/constants/music/player-buttons";
import { addISRCSongs } from "@/music/heizou/add-new-song";
import { getRecommendations } from "@/music/resolvers/recommendations";
import { ResolvableTrack } from "@/music/structures/ResolvableTrack";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { defer, send } from "@/lib/message-handler";
import { RateLimitManager } from "@sapphire/ratelimits";
import { createPlayEmbed } from "@/constants/music/create-play-embed";
import { XiaoLoadType } from "@/music/interfaces/player.types";
import { Embed } from "@/utils/messages";
import { resolveKey } from "@sapphire/plugin-i18next";

const limitInMillis =
  process.env.NODE_ENV === "production" ? 2 * 60 * 1000 : 10000; // 2 minutes

const iaModeRateLimit = new RateLimitManager(limitInMillis);

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

    const rateLimit = iaModeRateLimit.acquire(interaction.user.id);

    await defer(interaction);

    if (rateLimit.limited) {
      const embed = new EmbedBuilder().setDescription(
        [
          "### Você atingiu o limite de recomendações, tente novamente mais tarde!",
          ``,
        ].join("\n"),
      );

      await send(interaction, {
        embeds: [embed],
      }).dispose();
      return;
    }

    try {
      const recommendations = await getRecommendations(interaction.user.id, {
        limit: 25,
      });

      if (recommendations.status === "error") {
        await send(interaction, {
          embeds: Embed.error("Ocorreu um erro ao buscar as recomendações."),
          ephemeral: true,
        }).dispose(5000);
        return;
      }

      if (recommendations.data.length === 0) {
        await send(interaction, {
          embeds: Embed.error(
            "Não possuimos uma amostra grande, continue ouvindo músicas e tente novamente!",
          ),
        }).dispose(10000);
        return;
      }

      rateLimit.consume();

      const addedSongs = await addISRCSongs(
        recommendations.data.map(
          (rec) =>
            new ResolvableTrack({
              encoded: "",
              info: {
                identifier: rec.id,
                uri: rec.external_url,
                author: rec.artists[0].name,
                sourceName: "spotify",
                title: rec.name,
                duration: rec.duration_ms,
                position: 0,
                isStream: false,
                isSeekable: true,
              },
              isrc: rec.isrc,
            }),
        ),
        interaction.member,
      );

      const playerEmbed = await createPlayEmbed(interaction.member, {
        type: XiaoLoadType.PLAYLIST_LOADED,
        tracks: addedSongs,
        playlist: {
          name: "Recomendações",
          url: "https://twokei.com",
        },
      });

      await send(interaction, playerEmbed).dispose();
    } catch (e) {
      await send(interaction, {
        embeds: Embed.error(
          await resolveKey(interaction, getReadableException(e)),
        ),
      }).dispose();
    }
  }

  public override parse(
    interaction: ButtonInteraction,
  ): Awaitable<Option<unknown>> {
    return interaction.customId === EmbedButtons.QUICK_PLAYLIST
      ? this.some()
      : this.none();
  }
}
