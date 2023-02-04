import { MessageBuilder, CommandContext, CommandResponse, createCommand } from 'twokei-framework';
import { skipSong } from '../music/heizou/skip-song';
import { getReadableException } from '../exceptions/utils/get-readable-exception';


const execute = async (context: CommandContext<{ amount: number }>): Promise<CommandResponse> => {

  const { guild, input: { amount } } = context;

  if (!guild) {
    return;
  }

  return skipSong(guild.id, amount ?? 1)
    .then(() => new MessageBuilder({ content: 'Skipped' }))
    .catch(getReadableException);
}

export const nextCommand = createCommand({
  name: 'skip',
  description: 'Skip a track',
  aliases: ['next'],
  slash: (builder) => {
    return builder
      .addIntegerOption((option) =>
        option
          .setName('amount')
          .setDescription('Skip amount')
          .setRequired(false)
      )
  },
  execute: execute
});