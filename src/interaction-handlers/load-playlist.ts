import { ButtonBuilder, ButtonInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import {
  InteractionHandler,
  InteractionHandlerTypes,
  type None,
  type Option,
} from "@sapphire/framework";
import { EmbedButtons } from "@/constants/music/player-buttons";
import { defer, followUp, send } from "@/lib/message-handler";
import { Embed } from "@/utils/messages";
import { fetchWebApi } from "@/lib/api-web";
import { Action, Pagination } from "@/lib/message-handler/pagination";
import {
  ActionRowBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { spotifyProfileResolver } from "@/music/resolvers/spotify/spotify-profile-resolver";
import { inlineCode } from "@discordjs/formatters";
import { addMilliseconds, format } from "date-fns";
import { Playlist } from "@/music/resolvers/resolver";
import { noop } from "@sapphire/utilities";
import { playSong } from "@/features/music/play-song";
import { Icons, RawIcons } from "@/constants/icons";
import { getPremiumStatus, isUserPremium } from "@/lib/user-benefits/benefits";

@ApplyOptions<InteractionHandler.Options>({
  name: "load-playlist",
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class LoadPlaylist extends InteractionHandler {
  public async run(interaction: ButtonInteraction) {
    const member = interaction.member;

    if (!isGuildMember(member)) {
      return;
    }
    await defer(interaction, {
      ephemeral: true,
    });

    const result = await fetchWebApi<Record<string, string[]>>(
      `/api/user/${member.id}/playlists`,
    );

    if (result.status !== "success") {
      await send(interaction, {
        embeds: Embed.error(
          "Sinto muito, algo deu errado ao carregar suas playlists, tente novamente mais tarde.",
        ),
      });
      return;
    }

    const flatten = Object.entries(result.data).flatMap(([key, value]) =>
      value.map((id) => ({ source: key, id })),
    );

    if (flatten.length === 0) {
      await send(interaction, {
        embeds: Embed.error([
          "Ops... Parece que você não tem nenhuma playlist salva/sincronizada.",
        ]),
        components: [
          new ActionRowBuilder<ButtonBuilder>({
            components: [
              new ButtonBuilder({
                url: "https://twokei.com/profile/sync",
                style: ButtonStyle.Link,
                label: "Gerenciar playlists",
                emoji: RawIcons.Premium,
              }),
            ],
          }),
        ],
      });
      return;
    }

    const buttons = this.createButtons();

    const pages = await Promise.all(
      flatten.map((playlist) => this.preparePage(playlist)),
    );

    const pagination = new Pagination<{
      playlist: Playlist;
    }>(interaction, pages, buttons);

    await pagination.run();

    setTimeout(
      () => {
        pagination.stop();
      },
      1000 * 60 * 2,
    );
  }

  private async preparePage(playlist: {
    source: string;
    id: string;
  }): Promise<(context: Pagination) => Promise<EmbedBuilder>> {
    return async (context: Pagination) => {
      const details = await spotifyProfileResolver.playlist(playlist.id);

      const { source, id } = playlist;

      if (!source || !id) {
        return new EmbedBuilder()
          .setTitle("No playlists found")
          .setDescription("You have no playlists saved");
      }

      context.state.playlist = details;

      const embed = new EmbedBuilder();

      const maxShown = 8;
      const more = details.tracks.total - maxShown;

      const tracks = details.tracks.items.slice(0, maxShown).map((track) => {
        const artists = track.artists.map((artist) => artist.name).join(", ");
        const duration = this.formatMilis(track.duration);

        return `(${duration}) **[${track.name} - ${artists}](${track.href})**`;
      });

      const description = [
        `### ${inlineCode(details.name)}`,
        " ",
        ...tracks,
        `+ ${more} tracks`,
      ].join("\n");

      embed.setDescription(description);

      if (details.images?.length) {
        embed.setThumbnail(details.images[0].url);
      }

      if (details.owner?.name) {
        embed.setFooter({
          text: `${details.owner.name}'s playlist | https://twokei.com`,
        });
      }

      return embed;
    };
  }

  private createButtons(): Action[] {
    return [
      {
        customId: "previous",
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        emoji: "⏮️",
        run: async ({ collectedInteraction, handler }) => {
          await collectedInteraction.deferUpdate().catch(noop);
          await handler.previous();
        },
      },
      {
        customId: "play",
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        emoji: "▶️",
        run: async ({ collectedInteraction: selectInteraction, handler }) => {
          if (!selectInteraction.isButton()) {
            return;
          }

          const playlist = handler.state.playlist as Playlist;

          await defer(selectInteraction, {
            ephemeral: true,
          });

          if (!playlist) {
            await followUp(selectInteraction, {
              embeds: Embed.error(
                "Sinto muito, algo deu errado ao carregar suas playlists, tente novamente mais tarde.",
              ),
            });
            return;
          }

          const premiumStatus = await getPremiumStatus(
            selectInteraction.user.id,
          );

          if (premiumStatus === "expired") {
            await send(selectInteraction, {
              ephemeral: true,
              embeds: Embed.error([
                `### Parece que você não é mais um usuário ${Icons.Premium} **Premium**.`,
                "Renove e continue ouvindo suas músicas favoritas!",
                `Se não puder, tudo bem ${Icons.Hanakin}! Continue ouvindo suas músicas no **Twokei**!`,
                "Faça parte do Ranking e recupere seu título de **Premium**",
              ]),
              components: [
                new ActionRowBuilder<ButtonBuilder>({
                  components: [
                    new ButtonBuilder({
                      url: "https://twokei.com/profile/premium",
                      style: ButtonStyle.Link,
                      label: "Premium",
                      emoji: RawIcons.Premium,
                    }),
                  ],
                }),
              ],
            });
            return;
          } else if (premiumStatus === "never-subscribed") {
            await followUp(selectInteraction, {
              ephemeral: true,
              embeds: Embed.error([
                `### ${Icons.Hanakin} Oops... Esse é um recurso ${Icons.Premium} **Premium**.`,
                "Sabia que você pode ouvir suas playlists diretamente no Twokei?",
                `Tenha acesso a este e mais diversos benefícios, como nossa **IA Personalizada**`,
                `Se torne um usuário ${Icons.Premium} **Premium**!`,
              ]),
              components: [
                new ActionRowBuilder<ButtonBuilder>({
                  components: [
                    new ButtonBuilder({
                      url: "https://twokei.com/profile/premium",
                      style: ButtonStyle.Link,
                      label: "Premium",
                      emoji: RawIcons.Premium,
                    }),
                  ],
                }),
              ],
            });
            return;
          }

          await selectInteraction.deleteReply();

          await playSong(selectInteraction, playlist.href, {
            member: selectInteraction.member,
          }).catch(noop);

          selectInteraction.channel
            ?.send({
              embeds: Embed.info([
                `${selectInteraction.member!.toString()} utilizou uma função ${
                  Icons.Premium
                } **Premium**.`,
                `Obrigado por fazer parte de nossa vibe!`,
              ]),
            })
            .then((message) => {
              setTimeout(() => {
                message.delete().catch(noop);
              }, 1000 * 10);
            });

          handler.stop();
        },
      },
      {
        customId: "next",
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        emoji: "⏭️",
        run: async ({ collectedInteraction, handler }) => {
          await collectedInteraction.deferUpdate().catch(noop);
          await handler.next();
        },
      },
      {
        url: "https://twokei.com/profile/sync",
        style: ButtonStyle.Link,
        type: ComponentType.Button,
        label: "Gerenciar playlists",
        emoji: RawIcons.Premium,
      },
    ];
  }

  public parse(buttonInteraction: ButtonInteraction): Option<None> {
    if (buttonInteraction.customId === EmbedButtons.PLAYLIST_SYNC) {
      return this.some();
    }

    return this.none();
  }

  private formatMilis(millis: number) {
    const referenceDate = new Date(0);

    const newDate = addMilliseconds(referenceDate, millis);

    return format(newDate, "mm:ss");
  }
}
