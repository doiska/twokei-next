import { registerCommand } from "../handlers/command/CommandRegister";
import { CommandContext, CommandResponse } from "../handlers/command/command.types";
import { Twokei } from "../app/Twokei";
import { logger } from "../utils/Logger";
import { PlayerException } from "../structures/PlayerException";
import { ResponseType } from "../structures/ExtendedPlayer";


const execute = async (context: CommandContext<{ input: string, input2: string }>): Promise<CommandResponse> => {

  const { member } = context;

  if (!member || !member?.guild) {
    logger.error("No member or guild");
    return;
  }

  try {
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

    const response = await player.play(input);

    const trackAmount = player.queue.length + 1;
    const title = ResponseType.NEW_TRACK_ADDED_TO_QUEUE === response ? input : `(${player.current?.info.title}[${player.current?.info.uri}]`;

    const markdown = '``';

    return `Playing ${markdown}${title}${markdown} in **${member.guild.name}** with **${trackAmount} tracks** in queue.`;
  } catch (e) {
    if (e instanceof PlayerException) {
      return e.message;
    }

    return "An error occured while trying to play the track.";
  }
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