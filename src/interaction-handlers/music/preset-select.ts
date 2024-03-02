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
import { logger } from "@/lib/logger";

import { playerPlaylists } from "@/db/schemas/player-playlists";
import { addNewSong } from "@/music/heizou/add-new-song";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import { Icons } from "@/constants/icons";

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

    await addNewSong(playlistUrl, interaction.member);

    const curatorsWarning = new EmbedBuilder().setDescription(
      [
        " ",
        `### ${Icons.HanakoEating} Quer ver sua playlist aqui?`,
        "Entre em contato comigo em meu servidor de suporte!",
        "Contribua com a comunidade e ajude a manter a playlist atualizada!",
        "Entre em: https://twokei.com/discord",
        " ",
      ].join("\n"),
    );

    await interaction.reply({
      embeds: [curatorsWarning],
    });
  }
}

void container.stores.loadPiece({
  name: "preset-select-menu",
  piece: PresetSelectMenuInteraction,
  store: "interaction-handlers",
});
