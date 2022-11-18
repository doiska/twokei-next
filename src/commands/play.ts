import { registerCommand } from "../handlers/command/CommandRegister";
import { CommandContext, CommandResponse } from "../handlers/command/command.types";
import { Twokei } from "../app/Twokei";


const execute = async (context: CommandContext<{ input: string, input2: string }>): Promise<CommandResponse> => {

  const { member } = context;

  if (!member || !member?.guild) {
    console.log("No member or guild");
    return;
  }

  const player = await Twokei.music.connect({ guild: member?.guild, member });
  await player.play('https://www.youtube.com/watch?v=QFqk_irxeW4');
  await player.play('ytsearch:lofi hiphop');

  console.log(player.queue);
  setTimeout(async () => {
    await player.next();
    console.log(player.queue);
  }, 5000);


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
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("input2")
          .setDescription("Input 2")
          .setRequired(false)
      );
  },
}, execute);