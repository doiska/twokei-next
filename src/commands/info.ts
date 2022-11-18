import { CommandContext } from "../handlers/command/command.types";
import { registerCommand } from "../handlers/command/CommandRegister";
import { Twokei } from "../app/Twokei";

const execute = (context: CommandContext) => {
  return `Running clusters: ${Twokei.cluster.count}`;
}

registerCommand({ name: 'info', description: 'Get information about the bot' }, execute);