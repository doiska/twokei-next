import { EmbedBuilder, type Guild } from "discord.js";
import { container } from "@sapphire/framework";

import { type VentiInitOptions } from "@/music/interfaces/player.types";

import { logger } from "@/lib/logger";
import { isTextChannel } from "@sapphire/discord.js-utilities";
import { Icons } from "@/constants/icons";
import { dispose } from "@/lib/message-handler/utils";

interface InitOptions {
  guild: Guild;
  voiceChannel: string;
}

export async function createPlayerInstance({
  guild,
  voiceChannel,
}: InitOptions) {
  const player = container.xiao.getPlayer(guild.id);

  if (player) {
    return player;
  }

  const playerOptions: VentiInitOptions = {
    guild,
    voiceChannel,
    shardId: guild.shardId,
    deaf: true,
  };

  //TODO: revisar este fluxo, é possível que o erro de canal inexiste não esteja sendo tratado

  const { message, channel } = (await container.sc.getEmbed(guild)) ?? {};

  if (!message || !channel) {
    logger.warn(
      `No message or channel found for guild ${guild.name} while creating player instance.`,
      {
        guildId: guild.id,
        message: message?.id,
        channel: channel?.id,
      },
    );

    const songChannel = await container.sc.get(guild.id);

    if (!songChannel) {
      logger.error(
        `No song channel found for guild ${guild.name} while creating player instance.`,
        {
          guildId: guild.id,
          message: message?.id,
          channel: channel?.id,
        },
      );
    }

    if (songChannel?.channelId) {
      const channel = await guild.channels.fetch(songChannel.channelId);

      if (channel && isTextChannel(channel)) {
        await channel.send({
          embeds: [
            new EmbedBuilder().setDescription(
              [
                "## Atualize as permissões do Twokei",
                "### Tivemos um problema ao utilizar o canal de música.",
                "### Como atualizar:",
                "- Clique no perfil do bot e adicione novamente ao servidor",
                "- Ou acesse: https://twokei.com/invite",
                " ",
                `**${Icons.Hanakin} Sentimos pelo inconveniente.**`,
              ].join("\n"),
            ),
          ],
        });
      }
    }
  }

  try {
    return await container.xiao.createPlayer(playerOptions);
  } catch (error) {
    logger.error(
      `Error while creating player instance for guild ${guild.name}.`,
      {
        guildId: guild.id,
        error,
      },
    );

    await channel
      ?.send({
        embeds: [
          new EmbedBuilder().setDescription(
            [
              "## Ocorreu um erro ao criar o player de música.",
              "### Como resolver:",
              "- Confirme se o Twokei tem acesso a este canal de voz/texto",
              "- Convide-o novamente para o servidor (https://twokei.com)",
              `**${Icons.Hanakin} Sentimos pelo inconveniente.**`,
            ].join("\n"),
          ),
        ],
      })
      .then(dispose)
      .catch(logger.error);
  }
}
