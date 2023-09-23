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
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { Icons, RawIcons } from "@/constants/icons";
import { defer, send } from "@/lib/message-handler";
import { RateLimitManager } from "@sapphire/ratelimits";
import { createPlayEmbed } from "@/constants/music/create-play-embed";
import { XiaoLoadType } from "@/music/interfaces/player.types";
import { logger } from "@/lib/logger";
import { isUserPremium } from "@/lib/user-benefits/benefits";
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

    if (rateLimit.limited) {
      const embed = new EmbedBuilder().setDescription(
        [
          "### Você atingiu o limite de recomendações, tente novamente mais tarde!",
          "Se torne **Premium** para adicionar quantas músicas quiser!",
        ].join("\n"),
      );

      await send(interaction, {
        embeds: [embed],
        components: [premiumButton],
      }).dispose();
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

      if (!isPremium) {
        rateLimit.consume();
      }

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

      const premiumDescription = [
        `### ${Icons.Premium} 25 músicas com o Modo IA por ser um usuário **Premium**!`,
        "**Obrigado por fazer parte de nossa vibe, você é incrível!**",
      ];

      const nonPremiumDescription = [
        "### Se torne **Premium** para adicionar quantas músicas quiser!",
        `${Icons.Hanakin} Você adicionou somente 5 músicas com o Modo IA!`,
        "Visite https://twokei.com para mais informações.",
      ];

      const premiumEmbed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(
          (isPremium ? premiumDescription : nonPremiumDescription)
            .filter(Boolean)
            .join("\n"),
        );

      await send(interaction, {
        embeds: [premiumEmbed, ...playerEmbed.embeds],
        components: [premiumButton],
      }).dispose();
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
