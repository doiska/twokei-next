import { CommandContext, CommandResponse, createCommand, MessageBuilder } from 'twokei-framework';
import { skipSong } from '../../music/heizou/skip-song';
import { getReadableException } from '../../structures/exceptions/utils/get-readable-exception';


const execute = async (context: CommandContext<{ amount: number }>): Promise<CommandResponse> => {

  const { member, guild, input: { amount } } = context;

  if (!member) {
    return;
  }

  return skipSong(member, amount ?? 1)
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