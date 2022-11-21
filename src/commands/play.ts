import { registerCommand } from "../handlers/command/CommandRegister";
import { CommandContext, CommandResponse } from "../handlers/command/command.types";
import { Twokei } from "../app/Twokei";
import { logger } from "../utils/Logger";


const execute = async (context: CommandContext<{ input: string, input2: string }>): Promise<CommandResponse> => {

  const { member } = context;

  if (!member || !member?.guild) {
    logger.error("No member or guild");
    return;
  }

  const player = await Twokei.music.connect({ guild: member.guild, member });

  if (!player) {
    logger.error("No player found");
    return;
  }

  const { input } = context.args;

  if(!input) {
    logger.error("No input provided");
    return;
  }

  logger.verbose(`Playing ${input} in ${member.guild.name}`);

  await player.play(input);

  return `Playing ${player.queue.length} tracks`;
}

registerCommand({
  name: "play",
  slash: (builder) => {
    return builder
      .addStringOption((option) =>
        option
          .setName("input")
          .setDescription("Input")
          .setRequired(true)
      )
  },
}, execute);