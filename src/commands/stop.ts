import { CommandContext } from "../handlers/command/command.types";
import { registerCommand } from "../handlers/command/CommandRegister";

const stopCommand = async (context: CommandContext) => {
  const { guild } = context;

  if (!guild) {
    return;
  }

  const player = context.client.music.getPlayer(guild.id);

  if (!player) {
    return;
  }

  await player.leave();

  return `Stopped playing`;
}

registerCommand({
  name: 'stop',
  description: 'Stop the current song',
}, stopCommand);