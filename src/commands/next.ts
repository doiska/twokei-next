import { registerCommand } from "../handlers/command/CommandRegister";
import { CommandContext, CommandResponse } from "../handlers/command/command.types";
import { Twokei } from "../app/Twokei";
import { logger } from "../utils/Logger";


const execute = async (context: CommandContext<{ amount: number }>): Promise<CommandResponse> => {

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

  const { amount } = context.args;

  await player.next(amount || 1);

  return `Playing next track`;
}

registerCommand({
  name: "skip",
  description: "Skip a track",
  aliases: ["next"],
  slash: (builder) => {
    return builder
      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription("Skip amount")
          .setRequired(false)
      )
  },
}, execute);