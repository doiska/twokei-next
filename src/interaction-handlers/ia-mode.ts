import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
  type Option,
} from "@sapphire/framework";
import type { ButtonInteraction } from "discord.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
} from "discord.js";
import type { Awaitable } from "@sapphire/utilities";
import { EmbedButtons } from "@/constants/music/player-buttons";
import { addISRCSongs } from "@/music/heizou/add-new-song";
import { getRecommendations } from "@/music/recommendation/get-recommendations";
import { ResolvableTrack } from "@/music/structures/ResolvableTrack";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import { sendPresetMessage } from "@/lib/message-handler/helper";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { Icons, RawIcons } from "@/constants/icons";
import { defer } from "@/lib/message-handler";
import { RateLimitManager } from "@sapphire/ratelimits";
import { createPlayEmbed } from "@/constants/music/create-play-embed";
import { LoadType } from "@/music/interfaces/player.types";
import { logger } from "@/lib/logger";
import { isUserPremium } from "@/lib/user-benefits/benefits";

const limitInMillis =
  process.env.NODE_ENV === "production" ? 2 * 60 * 1000 : 1000; // 2 minutes

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

    const isPremium = await isUserPremium(interaction.user.id);

    const premiumButton = new ActionRowBuilder<ButtonBuilder>({
      components: [
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL("https://twokei.com")
          .setLabel("Benefícios Premium")
          .setEmoji(RawIcons.Premium),
      ],
    });

    if (rateLimit.limited && !isPremium) {
      const embed = new EmbedBuilder().setDescription(
        [
          "### Você atingiu o limite de recomendações.",
          "Se torne **Premium** para adicionar quantas músicas quiser!",
        ].join("\n"),
      );

      await sendPresetMessage({
        interaction,
        preset: "error",
        embeds: [embed],
        components: [premiumButton],
        ephemeral: true,
      });
      return;
    }

    logger.info(
      `[IA-MODE] ${interaction.user.id} is requesting recommendations | isPremium: ${isPremium}`,
    );

    try {
      const recommendations = await getRecommendations(interaction.user.id, {
        limit: isPremium ? 25 : 5,
      });

      if (recommendations.status === "error") {
        logger.error(
          `[IA-MODE] ${interaction.user.id} error while getting recommendations`,
          recommendations,
        );

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

      if (!isPremium) {
        rateLimit.consume();
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

      const playerEmbed = await createPlayEmbed(interaction.member, {
        type: LoadType.PLAYLIST_LOADED,
        tracks: addedSongs,
        playlist: {
          name: "Recomendações",
          url: "https://twokei.com",
        },
      });

      const premiumDescription = [
        `### ${Icons.Premium} 25 músicas com o Modo IA por ser um usuário **Premium**!`,
        "**Obrigado por fazer parte de nossa vibe, você é incrível!**",
      ];

      const nonPremiumDescription = [
        `${Icons.Hanakin} Você adicionou 5 músicas com o Modo IA!`,
        "Se torne **Premium** para adicionar quantas músicas quiser!",
        "Visite https://twokei.com para mais informações.",
      ];

      const premiumEmbed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(
          (isPremium ? premiumDescription : nonPremiumDescription)
            .filter(Boolean)
            .join("\n"),
        );

      await sendPresetMessage({
        interaction,
        preset: "success",
        embeds: [premiumEmbed, ...playerEmbed.embeds],
        components: [premiumButton],
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
