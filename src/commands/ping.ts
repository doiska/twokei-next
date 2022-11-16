import { registerCommand } from "../handlers/command/CommandRegister";
import { CommandContext, CommandResponse } from "../handlers/command/command.types";


const execute = async (context: CommandContext<{ input: string, input2: string }>): Promise<CommandResponse> => {
  return "Pong!";
}

registerCommand({
  name: "ping",
  slash: (builder) => {
    return builder
      .addStringOption((option) =>
        option
          .setName("input")
          .setDescription("Input")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("input2")
          .setDescription("Input 2")
          .setRequired(true)
      );
  },
}, execute);