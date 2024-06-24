import { APIEmbed, ButtonInteraction, Colors } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
  type None,
  type Option,
} from "@sapphire/framework";

import { EmbedButtons } from "@/constants/buttons";

import { fetchT } from "@/i18n";
import { Icons } from "@/constants/icons";
import { send } from "@/lib/message-handler";

@ApplyOptions<InteractionHandler.Options>({
  name: "news-button",
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
class NewsButtonInteraction extends InteractionHandler {
  public async run(interaction: ButtonInteraction): Promise<void> {
    const t = await fetchT(interaction);

    const newsText: APIEmbed = t("news:embed", {
      returnObjects: true,
    });

    const newsEmbed = EmbedBuilder.from(newsText)
      .setFooter({
        text: "Obrigado por fazer parte da nossa vibe! 💖",
      })
      .setColor(Colors.DarkGold);

    const profile = new EmbedBuilder()
      .setDescription(
        [
          `## ${Icons.Hanakin} Novo Perfil!`,
          "Você tem um perfil único de acordo com seu tema do Discord!",
          "Conta com um **novo visual** e **ranking de músicas ouvidas!**",
          "Clique em 'Ver Perfil' para visualizar.",
        ].join("\n"),
      )
      .setImage(
        "https://cdn.discordapp.com/ephemeral-attachments/1199121261184434318/1207051822863351910/file.jpg?ex=65de3d9c&is=65cbc89c&hm=7a570e7a47e5516656d3ecbc0b96e989f7fa316d6cce275bfa135d2ae4dc981c&",
      )
      .setColor(Colors.DarkGold);

    const title = new EmbedBuilder()
      .setDescription(
        [`# ${Icons.Lightning} Twokei Music - Novidades`].join("\n"),
      )
      .setColor(Colors.DarkGold);

    await send(interaction, {
      embeds: [title, newsEmbed, profile],
      ephemeral: true,
    });
  }

  public parse(interaction: ButtonInteraction): Option<None> {
    if (interaction.customId !== EmbedButtons.NEWS) {
      return this.none();
    }

    return this.some();
  }
}

void container.stores.loadPiece({
  name: "news-button",
  piece: NewsButtonInteraction,
  store: "interaction-handlers",
});
