import { registerCommand } from "../handlers/command/CommandRegister";
import { CommandContext, CommandResponse } from "../handlers/command/command.types";
import { Twokei } from "../app/Twokei";
import { logger } from "../utils/Logger";


const execute = async (context: CommandContext): Promise<CommandResponse> => {

  const { member } = context;

  if (!member || !member?.guild) {
    logger.error("No member or guild");
    return;
  }

  const player = await Twokei.music.get(member.guild.id);

  if(!player) {
    logger.error("No player found");
    return "No player found";
  }

  const map = player.queue.map((track, index) => `${index + 1}. ${track.info.title}`);

  return map.join("\n");
}

registerCommand({
  name: "queue",
  description: "List songs"
}, execute);