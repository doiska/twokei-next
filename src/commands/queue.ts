import { registerCommand } from "../handlers/command/CommandRegister";
import { CommandContext, CommandResponse } from "../handlers/command/command.types";
import { Twokei } from "../app/Twokei";
import { logger } from "../utils/Logger";
import { EmbedBuilder } from "discord.js";


const execute = async (context: CommandContext): Promise<CommandResponse> => {

  const { member } = context;

  if (!member || !member?.guild) {
    logger.error("No member or guild");
    return;
  }

  const player = await Twokei.music.getPlayer(member.guild.id);

  if (!player) {
    logger.error("No player found");
    return "No player found";
  }

  const _queue = [player.current, ...player.queue];

  const map = _queue
    .filter(Boolean)
    .map((track, index) => `${index + 1}. [${track?.info.title}](${player.current?.info.uri || ""})`);

  const embed = new EmbedBuilder()
    .setTitle(`Queue of ${member.guild.name}!`)
    .setDescription(map.join("\n") || "No tracks in queue")
    .setFields([
      {
        name: "Paused",
        value: `${player.paused}`
      },
      {
        name: "Connection state",
        value: `${player.connection.state}`
      },
      {
        name: "Q Time",
        value: `${player.queueTime}`
      },
      {
        name: "Status",
        value: `${player.playing}`
      }
    ]);

  return embed;

}

registerCommand({
  name: "queue",
  description: "List songs"
}, execute);