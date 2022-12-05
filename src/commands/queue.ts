import { registerCommand } from "../handlers/command/CommandRegister";
import { CommandContext, CommandResponse } from "../handlers/command/command.types";
import { Twokei } from "../app/Twokei";
import { logger } from "../utils/Logger";
import { EmbedBuilder } from "discord.js";


const execute = async (context: CommandContext): Promise<CommandResponse> => {

  const { member, guild } = context;

  if (!member || !member?.guild) {
    logger.error("No member or guild");
    return;
  }

  const player = await Twokei.xiao.getPlayer(member.guild.id);

  if (!player) {
    logger.error("No player found");
    return "No player found";
  }

  const _queue = [player.queue.current, ...player.queue];

  const map = _queue
    .filter(Boolean)
    .map((track, index) => `${index + 1}. [${track?.info.title}](${player.queue.current?.info.uri || ""})`);

  const isPlaying = player.playing;

  return new EmbedBuilder()
    .setTitle(isPlaying ? `Now playing ${player.queue.current?.info.title}` : `Paused ${player.queue.current?.info.title}`)
    .setURL(player.queue.current?.info.uri || "")
    .setDescription(map.join("\n") || "No tracks in queue")
}

registerCommand({
  name: "queue",
  description: "List songs"
}, execute);