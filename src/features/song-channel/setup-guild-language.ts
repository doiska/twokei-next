import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  type GuildTextBasedChannel,
  type PermissionsBitField,
} from "discord.js";
import { noop } from "@sapphire/utilities";

import { eq } from "drizzle-orm";
import { kil } from "@/db/Kil";
import { guilds } from "@/db/schemas/guild";

import { Twokei } from "@/app/Twokei";
import { type Locale, LocaleFlags, VALID_LOCALES } from "@/locales/i18n";

import { fetchT } from "twokei-i18next";

export async function setupGuildLanguage(channel: GuildTextBasedChannel) {
  const { guild } = channel;

  const language: Locale =
    guild.preferredLocale === "pt-BR" ? "pt_br" : "en_us";

  const ft = await fetchT(channel);

  const embed = new EmbedBuilder()
    .setTitle(ft("tutorial:language.title"))
    .setDescription(ft("tutorial:language.description", { joinArrays: "\n" }))
    .setThumbnail(Twokei.user?.displayAvatarURL({ size: 2048 }) ?? "");

  const languageButtons = VALID_LOCALES.map((locale) =>
    new ButtonBuilder()
      .setEmoji(LocaleFlags[locale])
      .setCustomId(`language-${locale}`)
      .setStyle(ButtonStyle.Secondary),
  );

  const helpButton = new ButtonBuilder()
    .setLabel(ft("tutorial:language.help"))
    .setURL("https://google.com")
    .setStyle(ButtonStyle.Link)
    .setDisabled(true);

  const row = new ActionRowBuilder<ButtonBuilder>({
    components: [...languageButtons, helpButton],
  });

  const message = await channel.send({ embeds: [embed], components: [row] });

  const interaction = await message
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (buttonInteraction) =>
        (buttonInteraction.member?.permissions as PermissionsBitField).has(
          "ManageChannels",
        ),
      time: 1000 * 60 * 5,
    })
    .catch(() => null);

  if (interaction) {
    void interaction.deferUpdate();
  }

  await message.delete().catch(noop);

  const newLocale = interaction?.customId.split("-")?.[1] ?? language;

  await kil
    .update(guilds)
    .set({ locale: newLocale })
    .where(eq(guilds.guildId, guild.id));

  return newLocale as Locale;
}
