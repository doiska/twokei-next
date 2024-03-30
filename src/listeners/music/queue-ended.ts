import { container, Listener } from "@sapphire/framework";
import { Events } from "@/music/interfaces/player.types";
import type { Venti } from "@/music/controllers/Venti";
import { ApplyOptions } from "@sapphire/decorators";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
} from "discord.js";
import { dispose } from "@/lib/message-handler/utils";
import { Icons } from "@/constants/icons";
import { noop } from "@sapphire/utilities";

@ApplyOptions<Listener.Options>({
  name: "player-destroyed-event",
  event: Events.PlayerDestroy,
  emitter: container.xiao,
  enabled: true,
})
export class PlayerDestroyedEvent extends Listener<
  typeof Events.PlayerDestroy
> {
  public async run(venti: Venti) {
    const channel = await container.sc.getEmbed(venti.guild);

    if (!channel) {
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
              "https://twitter.com/intent/tweet?text=Ouvindo música no meu Discord pelo https://twokei.com",
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
          `${Icons.Hanakin} Seu apoio é muito importante!`,
          " ",
          "Chave Pix: `462070f1-58e4-4bc8-b146-1510e5ca9fb1`",
          " ",
        ].join("\n"),
      )
      .setImage("https://cdn.twokei.com/pix.png");

    const donateMessage = await channel.channel.send({
      embeds: [donateEmbed],
      components: [buttons],
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
}

void container.stores.loadPiece({
  name: "player-destroyed-event",
  piece: PlayerDestroyedEvent,
  store: "listeners",
});
