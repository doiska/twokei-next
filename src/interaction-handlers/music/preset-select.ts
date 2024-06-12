import { EmbedBuilder, type StringSelectMenuInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";

import { Menus } from "@/constants/buttons";
import { kil } from "@/db/Kil";
import { playerPresets } from "@/db/schemas/player-presets";
import { eq } from "drizzle-orm";

import { addNewSong } from "@/music/heizou/add-new-song";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import { Icons } from "@/constants/icons";
import { dispose } from "@/lib/message-handler/utils";
import { logger } from "@/lib/logger";

@ApplyOptions<InteractionHandler.Options>({
  name: "preset-select-menu",
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.SelectMenu,
})
export class PresetSelectMenuInteraction extends InteractionHandler {
  public override parse(interaction: StringSelectMenuInteraction) {
    const [value] = interaction.values ?? [];

    if (!value || interaction.customId !== Menus.PresetMenu) {
      return this.none();
    }

    return this.some(value);
  }

  public override async run(
    interaction: StringSelectMenuInteraction,
    option: InteractionHandler.ParseResult<this>,
  ) {
    if (
      !interaction.guild ||
      !interaction.guildId ||
      !option ||
      !isGuildMember(interaction.member)
    ) {
      return;
    }

    const [preset] = await kil
      .select()
      .from(playerPresets)
      .where(eq(playerPresets.id, option.toLowerCase()));

    if (!preset?.categories?.length) {
      return;
    }

    const selectedCategory = preset.categories
      .sort(() => Math.random() - Math.random())
      .at(0)!;

    const playlistUrl = `https://open.spotify.com/playlist/${selectedCategory}`;

    try {
      await addNewSong(playlistUrl, interaction.member);
    } catch (error) {
      await interaction.channel
        ?.send({
          embeds: [
            new EmbedBuilder().setDescription(
              [
                "## Ocorreu um erro ao criar o player de música.",
                "### Como resolver:",
                "- Confirme se o Twokei tem acesso a este canal de voz/texto",
                "- Convide-o novamente para o servidor (https://music.twokei.com)",
                `**${Icons.Hanakin} Sentimos pelo inconveniente.**`,
              ].join("\n"),
            ),
          ],
        })
        .then(dispose)
        .catch(logger.error);
    }

    const curatorsWarning = new EmbedBuilder().setDescription(
      [
        " ",
        `### ${Icons.HanakoEating} Quer ver sua playlist aqui?`,
        "Entre em contato comigo em meu servidor de suporte!",
        "Contribua com a comunidade e ajude a manter a playlist atualizada!",
        "Entre em: https://discord.twokei.com",
        " ",
      ].join("\n"),
    );

    await interaction
      .reply({
        embeds: [curatorsWarning],
        fetchReply: true,
      })
      .then((interaction) => dispose(interaction, 10000));
  }
}

void container.stores.loadPiece({
  name: "preset-select-menu",
  piece: PresetSelectMenuInteraction,
  store: "interaction-handlers",
});
