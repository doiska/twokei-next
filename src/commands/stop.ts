import { CommandContext } from "../handlers/command/command.types";
import { registerCommand } from "../handlers/command/CommandRegister";

const stopCommand = async (context: CommandContext) => {
  const { guild } = context;

  if (!guild) {
    return;
  }

  const player = await context.client.xiao.getPlayer(guild.id);

  if (!player) {
    return "No player found";
  }

  player.destroy();

  return `Stopped playing`;
}

registerCommand({
  name: 'stop',
  description: 'Stop the current song',
}, stopCommand);