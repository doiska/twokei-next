
import { Twokei } from "../app/Twokei";
import { logger } from "../modules/Logger";
import { CommandContext, CommandResponse, createCommand } from "twokei-framework";


const execute = async (context: CommandContext<{ amount: number }>): Promise<CommandResponse> => {

  const { member } = context;

  if (!member || !member?.guild) {
    logger.error("No member or guild");
    return;
  }

  const player = Twokei.xiao.getPlayer(member.guild.id);

  if(!player) {
    logger.error("No player found");
    return "No player found";
  }


  return player.skip(context.input.amount).then(() => 'Skipped').catch(e => e.message);
}

export const nextCommand = createCommand({
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
  execute: execute
});