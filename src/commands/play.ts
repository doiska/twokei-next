import { registerCommand } from "../handlers/command/CommandRegister";
import { CommandContext, CommandResponse } from "../handlers/command/command.types";
import { Twokei } from "../app/Twokei";
import { logger } from "../utils/Logger";
import { PlayerException } from "../structures/PlayerException";
import { PlayerState } from "../xiao/interfaces/player.types";
import { clear } from "winston";

const execute = async (context: CommandContext<{ input: string, input2: string }>): Promise<CommandResponse> => {

  const { member } = context;

  if (!member || !member?.guild) {
    logger.error("No member or guild");
    return;
  }

  try {
    const { input } = context.args;

    if (!input) {
      logger.error("No input provided");
      return;
    }

    if (!member.voice.channel?.id) {
      return;
    }

    const player = await Twokei.xiao.createPlayer({
      guild: member.guild.id,
      channel: member.voice.channel.id,
    })

    const result = await Twokei.xiao.search(input);

    if (!result.tracks.length) {
      return "No tracks found";
    }

    player.queue.add(...result.tracks);

    if (!player.playing) {
      console.log("Not playing, playing now");
      player.play();
    }

    const i = setInterval(() => {
      if(player.state === PlayerState.DESTROYED) {
        clearInterval(i);
        return;
      }
      console.log(player.queue.current?.info.title);
    }, 5000);

    return `Added ${result.tracks.length} songs to the queue`;
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