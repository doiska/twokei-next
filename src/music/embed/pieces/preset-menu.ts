import { ActionRowBuilder, Guild, StringSelectMenuBuilder } from "discord.js";
import { Menus } from "@/constants/music/player-buttons";
import { capitalizeFirst } from "@/utils/helpers";
import { cache } from "@/utils/caching";
import { playerPresets } from "@/db/schemas/player-presets";
import { kil } from "@/db/Kil";
import { fetchT } from "@sapphire/plugin-i18next";

const getPlayerGenres = cache(async () => kil.select().from(playerPresets));

export async function getPresetMenu(guild: Guild) {
  const t = await fetchT(guild);
  const genres = await getPlayerGenres();

  const options = genres
    .map((genre) => ({
      label: t(`music:genres.${genre.id}`),
      value: genre.id,
      description: genre.genres?.map((g) => capitalizeFirst(g)).join(", "),
    }))
    .slice(0, 25);

  return new ActionRowBuilder<StringSelectMenuBuilder>({
    components: [
      new StringSelectMenuBuilder()
        .setCustomId(Menus.PresetMenu)
        .setPlaceholder("Create your own playlist :)")
        .setMinValues(0)
        .setMaxValues(1)
        .setOptions(options),
    ],
  });
}
