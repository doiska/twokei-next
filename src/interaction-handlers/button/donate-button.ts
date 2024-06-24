import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  Colors,
  EmbedBuilder,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
  type None,
  type Option,
} from "@sapphire/framework";

import { EmbedButtons } from "@/constants/buttons";

import { Icons } from "@/constants/icons";
import { dispose } from "@/lib/message-handler/utils";
import { noop } from "@sapphire/utilities";

@ApplyOptions<InteractionHandler.Options>({
  name: "donate-button",
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
class DonateButton extends InteractionHandler {
  public async run(interaction: ButtonInteraction) {
    if (!interaction.guild || !isGuildMember(interaction.member)) {
      return;
    }

    const donateEmbed = new EmbedBuilder()
      .setDescription(
        [
          `## Obrigado por utilizar o Twokei! ${Icons.HanakoEating}`,
          "O **Twokei** é um projeto **open-source**, totalmente livre e gratuito, mantido através de doações 💖",
          "Temos um custo significativo para manter o projeto ativo e em constante desenvolvimento.",
          `## ${Icons.Premium} Considere apoiar o projeto:`,
          `- Doando para o projeto, sendo via **🇧🇷 Pix ou 🍵 Ko-fi**, clicando em um dos botões abaixo.`,
          "- Ouvindo músicas! Quanto mais você ouve, mais o **Twokei** é divulgado para outras pessoas.",
        ].join("\n"),
      )
      .setColor(Colors.Blue);

    const buttons = new ActionRowBuilder<ButtonBuilder>({
      components: [
        new ButtonBuilder()
          .setLabel("Doar via Pix")
          .setCustomId("pix-donate")
          .setEmoji("🇧🇷")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel("Doar via Cartão (Ko-fi)")
          .setURL("https://ko-fi.com/doiska")
          .setEmoji("🍵")
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setLabel("Tweet sobre o Twokei")
          .setURL(
            new URL(
              "https://x.com/intent/tweet?text=Ouvindo música no meu Discord pelo https://music.twokei.com",
            ).toString(),
          )
          .setEmoji("🐦")
          .setStyle(ButtonStyle.Link),
      ],
    });

    const pixEmbed = new EmbedBuilder()
      .setDescription(
        [
          "### 💖 Obrigado por doar ao **Twokei**!",
          "Seu apoio é muito importante para manter o projeto ativo e em constante desenvolvimento.",
          " ",
          "Chave Pix: `462070f1-58e4-4bc8-b146-1510e5ca9fb1`",
          " ",
        ].join("\n"),
      )
      .setImage("https://cdn.twokei.com/pix.png");

    const donateMessage = await interaction.reply({
      embeds: [donateEmbed],
      components: [buttons],
      fetchReply: true,
    });

    dispose(donateMessage, 30_000);

    donateMessage
      .awaitMessageComponent({
        filter: (i) => i.customId === "pix-donate",
        time: 30_000,
      })
      .then(async (i) => {
        await i.deferUpdate();
        await donateMessage
          .reply({
            embeds: [pixEmbed],
            components: [],
          })
          .then((m) => dispose(m, 30_000));
      })
      .catch(noop);
  }

  public override parse(interaction: ButtonInteraction): Option<None> {
    const customId = interaction.customId;

    if (customId !== EmbedButtons.DONATE) {
      return this.none();
    }

    return this.some();
  }
}

void container.stores.loadPiece({
  name: "donate-button",
  piece: DonateButton,
  store: "interaction-handlers",
});
