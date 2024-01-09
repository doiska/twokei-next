import { ActionRowBuilder, Guild, StringSelectMenuBuilder } from "discord.js";
import { Menus } from "@/constants/music/player-buttons";
import { cache } from "@/utils/caching";
import { playerPresets } from "@/db/schemas/player-presets";
import { kil } from "@/db/Kil";
import { fetchT } from "@sapphire/plugin-i18next";

const getPlayerGenres = cache(async () => kil.select().from(playerPresets));

export async function getPresetMenu(guild: Guild) {
  const t = await fetchT(guild);
  const genres = await getPlayerGenres();

  const options = genres
    .map((genre) => {
      const {
        name,
        description: descriptions,
        emoji,
        // @ts-expect-error i18next types are broken
      } = t(`genres:${genre.id}`, {
        returnObjects: true,
        joinArrays: false,
      }) as {
        name: string;
        description: string[];
        emoji: string;
      };

      return {
        label: name,
        value: genre.id,
        description: descriptions.at(
          Math.floor(Math.random() * descriptions.length),
        ),
        emoji: emoji,
      };
    })
    .slice(0, 25);

  return new ActionRowBuilder<StringSelectMenuBuilder>({
    components: [
      new StringSelectMenuBuilder()
        .setCustomId(Menus.PresetMenu)
        .setPlaceholder("🎧 Não sabe o que ouvir? Escolha um preset!")
        .setMinValues(0)
        .setMaxValues(1)
        .setOptions(options),
    ],
  });
}
